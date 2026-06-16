import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const quizSchema = z.object({
  industry: z.string().min(1).max(100),
  team_size: z.string().min(1).max(20),
  primary_use_cases: z.array(z.string().max(50)).min(1).max(15),
  monthly_budget: z.string().min(1).max(20),
  current_tools: z.array(z.string().max(100)).max(50),
})


export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = quizSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const data = parsed.data
  const supabase = createServerClient()

  // Get the team for this user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('clerk_user_id', userId)
    .single()

  if (!profile) {
    return Response.json({ error: 'Profile not found' }, { status: 404 })
  }

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('profile_id', profile.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  // Auto-create a team if the user has none (happens on first quiz)
  let teamId: string
  if (!membership) {
    const slug = `team-${userId.slice(0, 8)}-${Date.now()}`
    const { data: newTeam, error: teamError } = await supabase
      .from('teams')
      .insert({ name: 'My Team', slug, plan: 'free' })
      .select('id')
      .single()

    if (teamError || !newTeam) {
      console.error('Team creation error:', teamError)
      return Response.json({ error: 'Failed to create team' }, { status: 500 })
    }

    await supabase.from('team_members').insert({
      team_id: newTeam.id,
      profile_id: profile.id,
      email: profile.email,
      role: 'admin',
      status: 'active',
      joined_at: new Date().toISOString(),
    })

    teamId = newTeam.id
  } else {
    teamId = membership.team_id
  }

  // Store quiz response
  const { data: quizResponse, error: insertError } = await supabase
    .from('quiz_responses')
    .insert({
      team_id: teamId,
      industry: data.industry,
      team_size: data.team_size,
      primary_use_cases: data.primary_use_cases,
      monthly_budget: data.monthly_budget,
      current_tools: data.current_tools,
    })
    .select('id')
    .single()

  if (insertError || !quizResponse) {
    console.error('Quiz insert error:', insertError)
    return Response.json({ error: 'Failed to save quiz' }, { status: 500 })
  }

  return Response.json({ quizResponseId: quizResponse.id })
}
