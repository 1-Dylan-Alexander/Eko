import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const updateSchema = z.object({
  role: z.enum(['admin', 'member']).optional(),
})

async function getAdminTeamId(userId: string) {
  const supabase = createServerClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()
  if (!profile) return null

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, role')
    .eq('profile_id', profile.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!membership || membership.role !== 'admin') return null
  return membership.team_id
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = await getAdminTeamId(userId)
  if (!teamId) return Response.json({ error: 'Admin access required' }, { status: 403 })

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
  const { data, error } = await supabase
    .from('team_members')
    .update(parsed.data)
    .eq('id', id)
    .eq('team_id', teamId)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  if (!data) return Response.json({ error: 'Member not found' }, { status: 404 })

  return Response.json({ data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const teamId = await getAdminTeamId(userId)
  if (!teamId) return Response.json({ error: 'Admin access required' }, { status: 403 })

  const { id } = await params
  const supabase = createServerClient()

  // Prevent removing the last admin
  const { data: admins } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('role', 'admin')
    .eq('status', 'active')

  const { data: target } = await supabase
    .from('team_members')
    .select('role')
    .eq('id', id)
    .eq('team_id', teamId)
    .single()

  if (target?.role === 'admin' && (admins?.length ?? 0) <= 1) {
    return Response.json({ error: 'Cannot remove the last admin' }, { status: 409 })
  }

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)
    .eq('team_id', teamId)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
