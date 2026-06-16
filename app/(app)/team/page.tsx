import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { PageHeader, Alert, Button, Separator } from '@/components/ui'
import { InviteForm } from '@/components/team/invite-form'
import { MemberList } from '@/components/team/member-list'
import { planAtLeast } from '@/lib/utils/plan'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Team — Ēko' }

export default async function TeamPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('clerk_user_id', userId)
    .single()

  if (!profile) redirect('/sign-in')

  const { data: membership } = await supabase
    .from('team_members')
    .select('id, role, teams(id, name, plan)')
    .eq('profile_id', profile.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  const team = membership?.teams as {
    id: string
    name: string
    plan: 'free' | 'pro' | 'enterprise'
  } | null

  const isAdmin = membership?.role === 'admin'
  const isPaid = planAtLeast(team?.plan ?? 'free', 'pro')

  // Load all members for this team
  const { data: rawMembers } = team
    ? await supabase
        .from('team_members')
        .select('id, email, role, status, profile_id, profiles(full_name)')
        .eq('team_id', team.id)
        .order('status')
        .order('role')
    : { data: [] }

  const members = (rawMembers ?? []).map((m) => ({
    id: m.id,
    email: m.email,
    role: m.role,
    status: m.status,
    full_name: (m.profiles as { full_name: string | null } | null)?.full_name ?? null,
  }))

  const planLabel: Record<string, string> = {
    free: 'Free',
    pro: 'Pro Team — up to 25 members',
    enterprise: 'Enterprise — unlimited members',
  }

  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage your team members and roles"
      />

      <div className="p-8 max-w-3xl space-y-8">

        {/* Team info */}
        {team && (
          <div className="border border-[#dddbd6] bg-white divide-y divide-[#dddbd6]">
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Team name</span>
              <span className="text-sm font-['Space_Grotesk'] text-[#111110]">{team.name}</span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Plan</span>
              <span className="text-sm font-['Space_Grotesk'] text-[#3a3935]">
                {planLabel[team.plan] ?? team.plan}
              </span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Members</span>
              <span className="text-sm font-['Space_Grotesk'] text-[#111110]">
                {members.filter((m) => m.status === 'active').length} active
                {members.filter((m) => m.status === 'pending').length > 0 &&
                  `, ${members.filter((m) => m.status === 'pending').length} pending`}
              </span>
            </div>
          </div>
        )}

        <Separator />

        {/* Invite section */}
        {isPaid && isAdmin ? (
          <section>
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
              Invite a member
            </p>
            <InviteForm />
          </section>
        ) : !isPaid ? (
          <section>
            <Alert variant="amber" title="Pro feature">
              Team invites are available on the Pro plan.{' '}
              <Link href="/pricing" className="underline underline-offset-2">
                Upgrade to Pro
              </Link>{' '}
              to invite up to 25 members.
            </Alert>
          </section>
        ) : (
          <section>
            <Alert title="Members only">
              Only team admins can invite new members. Contact your team admin to send an invite.
            </Alert>
          </section>
        )}

        <Separator />

        {/* Member list */}
        <section>
          <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
            Members
          </p>
          {members.length > 0 ? (
            <MemberList members={members} currentProfileId={profile.id} />
          ) : (
            <div className="border border-[#dddbd6] bg-white p-8 text-center">
              <p className="text-sm font-['Space_Grotesk'] text-[#7a7870]">No members yet.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
