import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const createSchema = z.object({
  ai_tool_id: z.string().uuid().nullable().optional(),
  custom_tool_name: z.string().max(120).nullable().optional(),
  seats: z.number().int().min(1).default(1),
  monthly_cost: z.number().min(0),
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

export async function GET() {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = await getTeamId(userId)
  if (!teamId) return Response.json({ error: 'No team found' }, { status: 404 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('team_subscriptions')
    .select('*, ai_tools(id, name, slug, category, logo_url)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ data })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = await getTeamId(userId)
  if (!teamId) return Response.json({ error: 'No team found' }, { status: 404 })

  // Check plan gate
  const supabase = createServerClient()
  const { data: team } = await supabase
    .from('teams')
    .select('plan')
    .eq('id', teamId)
    .single()

  if (!team || team.plan === 'free') {
    return Response.json({ error: 'Subscription tracking requires Pro plan' }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('team_subscriptions')
    .insert({ ...parsed.data, team_id: teamId })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Detect overlaps after adding
  await detectAndSaveOverlaps(teamId, supabase)

  return Response.json({ data }, { status: 201 })
}

// Overlap detection: flag categories with 2+ subscribed tools
async function detectAndSaveOverlaps(
  teamId: string,
  supabase: ReturnType<typeof createServerClient>
) {
  const { data: subs } = await supabase
    .from('team_subscriptions')
    .select('id, ai_tool_id, ai_tools(category)')
    .eq('team_id', teamId)
    .not('ai_tool_id', 'is', null)

  if (!subs || subs.length < 2) return

  // Group subscription IDs by category
  const byCategory: Record<string, string[]> = {}
  for (const sub of subs) {
    const tool = sub.ai_tools as { category: string } | null
    if (!tool) continue
    const cat = tool.category
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(sub.id)
  }

  // Clear existing non-dismissed alerts for this team
  await supabase
    .from('overlap_alerts')
    .delete()
    .eq('team_id', teamId)
    .eq('is_dismissed', false)

  // Insert new alerts for categories with 2+ tools
  for (const [category, ids] of Object.entries(byCategory)) {
    if (ids.length < 2) continue
    const severity = ids.length >= 4 ? 'high' : ids.length === 3 ? 'medium' : 'low'
    await supabase.from('overlap_alerts').insert({
      team_id: teamId,
      subscription_ids: ids,
      overlap_category: category,
      severity,
    })
  }
}
