import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const createSchema = z.object({
  tool_ids: z.array(z.string().uuid()).min(2).max(4),
  name: z.string().max(120).nullable().optional(),
})

async function getTeamId(userId: string) {
  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()
  if (!profile) return null

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('profile_id', profile.id)
    .eq('status', 'active')
    .limit(1)
    .single()
  return membership?.team_id ?? null
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = await getTeamId(userId)
  if (!teamId) return Response.json({ error: 'No team found' }, { status: 404 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('team_comparisons')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = await getTeamId(userId)
  if (!teamId) return Response.json({ error: 'No team found' }, { status: 404 })

  // Save comparisons is a Pro feature
  const supabase = createServerClient()
  const { data: team } = await supabase
    .from('teams')
    .select('plan')
    .eq('id', teamId)
    .single()

  if (!team || team.plan === 'free') {
    return Response.json({ error: 'Saving comparisons requires Pro plan' }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  // Build a name from tool names if not provided
  let name = parsed.data.name
  if (!name) {
    const { data: tools } = await supabase
      .from('ai_tools')
      .select('name')
      .in('id', parsed.data.tool_ids)
    name = tools?.map((t) => t.name).join(' vs ') ?? null
  }

  const { data, error } = await supabase
    .from('team_comparisons')
    .insert({
      team_id: teamId,
      tool_ids: parsed.data.tool_ids,
      name,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data }, { status: 201 })
}
