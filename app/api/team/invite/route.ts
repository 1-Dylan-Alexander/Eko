import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend/client'

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']).default('member'),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()

  // Get inviter's profile and team
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('clerk_user_id', userId)
    .single()
  if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

  const { data: membership } = await supabase
    .from('team_members')
    .select('role, team_id, teams(id, name, plan)')
    .eq('profile_id', profile.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!membership) return Response.json({ error: 'No active team' }, { status: 404 })
  if (membership.role !== 'admin') {
    return Response.json({ error: 'Only admins can invite members' }, { status: 403 })
  }

  const team = membership.teams as { id: string; name: string; plan: string } | null
  if (!team) return Response.json({ error: 'Team not found' }, { status: 404 })

  // Plan gate: free plan = 1 member only
  if (team.plan === 'free') {
    return Response.json({ error: 'Inviting team members requires Pro plan' }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { email, role } = parsed.data

  // Check if already a member
  const { data: existing } = await supabase
    .from('team_members')
    .select('id, status')
    .eq('team_id', team.id)
    .eq('email', email)
    .single()

  if (existing) {
    return Response.json(
      { error: existing.status === 'active' ? 'Already a member' : 'Invite already sent' },
      { status: 409 }
    )
  }

  // Create pending membership
  const { data: invite, error: insertError } = await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      email,
      role,
      status: 'pending',
    })
    .select()
    .single()

  if (insertError || !invite) {
    return Response.json({ error: 'Failed to create invite' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviterName = profile.full_name ?? profile.email
  const signUpUrl = `${appUrl}/sign-up`

  // Send invite email via Resend
  try {
    await resend.emails.send({
      from: 'Ēko <onboarding@resend.dev>',
      to: email,
      subject: `${inviterName} invited you to ${team.name} on Ēko`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111110;">
          <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 8px;">
            You've been invited to ${team.name}
          </h2>
          <p style="color: #3a3935; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            ${inviterName} invited you to join <strong>${team.name}</strong> on Ēko —
            the AI stack command center for business teams.
          </p>
          <a
            href="${signUpUrl}"
            style="display: inline-block; background: #111110; color: #ffffff; text-decoration: none;
                   padding: 10px 20px; font-size: 14px; font-weight: 500;"
          >
            Accept invite
          </a>
          <p style="color: #7a7870; font-size: 12px; margin-top: 32px;">
            You were invited as <strong>${role}</strong>. If you didn't expect this, you can ignore this email.
          </p>
        </div>
      `,
    })
  } catch (emailErr) {
    console.error('Failed to send invite email:', emailErr)
    // Don't fail the request — the membership row is created, email is a nice-to-have
  }

  // Log to audit
  await supabase.from('audit_log').insert({
    team_id: team.id,
    actor_profile_id: profile.id,
    action: 'member.invited',
    resource_type: 'team_member',
    resource_id: invite.id,
    metadata: { email, role },
  })

  return Response.json({ data: invite }, { status: 201 })
}
