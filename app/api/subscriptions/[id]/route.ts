import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const updateSchema = z.object({
  ai_tool_id: z.string().uuid().nullable().optional(),
  custom_tool_name: z.string().max(120).nullable().optional(),
  seats: z.number().int().min(1).optional(),
  monthly_cost: z.number().min(0).optional(),
  next_renewal_date: z.string().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = await getTeamId(userId)
  if (!teamId) return Response.json({ error: 'No team found' }, { status: 404 })

  const { id } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = createServerClient()

  // Ensure the subscription belongs to this team
  const { data, error } = await supabase
    .from('team_subscriptions')
    .update(parsed.data)
    .eq('id', id)
    .eq('team_id', teamId)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({ data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = await getTeamId(userId)
  if (!teamId) return Response.json({ error: 'No team found' }, { status: 404 })

  const { id } = await params
  const supabase = createServerClient()

  const { error } = await supabase
    .from('team_subscriptions')
    .delete()
    .eq('id', id)
    .eq('team_id', teamId)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return new Response(null, { status: 204 })
}
