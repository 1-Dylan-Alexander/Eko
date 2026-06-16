import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Badge, Button, Separator, PageHeader, Alert } from '@/components/ui'
import { BillingPortalButton } from '@/components/billing/billing-portal-button'
import { planAtLeast } from '@/lib/utils/plan'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings — Ēko' }

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser()
  const supabase = createServerClient()

  // Load profile + team
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('clerk_user_id', userId)
    .single()

  const { data: membership } = profile
    ? await supabase
        .from('team_members')
        .select('role, teams(id, name, plan, plan_expires_at, stripe_customer_id)')
        .eq('profile_id', profile.id)
        .eq('status', 'active')
        .limit(1)
        .single()
    : { data: null }

  const team = membership?.teams as {
    id: string
    name: string
    plan: 'free' | 'pro' | 'enterprise'
    plan_expires_at: string | null
    stripe_customer_id: string | null
  } | null

  const plan = team?.plan ?? 'free'
  const isPaid = planAtLeast(plan, 'pro')

  const planLabel: Record<string, string> = {
    free: 'Free',
    pro: 'Pro Team',
    enterprise: 'Enterprise',
  }

  const planBadgeVariant = (p: string) => {
    if (p === 'free') return 'default' as const
    if (p === 'enterprise') return 'amber' as const
    return 'green' as const
  }

  const displayName =
    profile?.full_name ??
    clerkUser?.firstName ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    'Unknown'

  const email =
    profile?.email ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    '—'

  const renewalDate = team?.plan_expires_at
    ? new Date(team.plan_expires_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account and team preferences"
      />

      <div className="p-8 max-w-2xl space-y-10">

        {/* Account */}
        <section>
          <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
            Account
          </p>
          <div className="border border-[#dddbd6] bg-white divide-y divide-[#dddbd6]">
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Name</span>
              <span className="text-sm font-['Space_Grotesk'] text-[#111110]">{displayName}</span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Email</span>
              <span className="text-sm font-['Space_Grotesk'] text-[#111110]">{email}</span>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-xs font-['Space_Mono'] text-[#7a7870]">
                Password &amp; security
              </span>
              <a
                href="https://accounts.clerk.dev/user"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-['Space_Mono'] text-[#3a3935] hover:text-[#111110] underline underline-offset-2 transition-colors"
              >
                Manage via Clerk
              </a>
            </div>
          </div>
        </section>

        <Separator />

        {/* Team */}
        {team && (
          <section>
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
              Team
            </p>
            <div className="border border-[#dddbd6] bg-white divide-y divide-[#dddbd6]">
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Team name</span>
                <span className="text-sm font-['Space_Grotesk'] text-[#111110]">{team.name}</span>
              </div>
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Role</span>
                <span className="text-sm font-['Space_Grotesk'] text-[#111110] capitalize">
                  {membership?.role ?? '—'}
                </span>
              </div>
            </div>
          </section>
        )}

        <Separator />

        {/* Billing */}
        <section>
          <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
            Billing
          </p>

          <div className="border border-[#dddbd6] bg-white divide-y divide-[#dddbd6] mb-4">
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Current plan</span>
              <Badge variant={planBadgeVariant(plan)}>{planLabel[plan] ?? plan}</Badge>
            </div>
            {renewalDate && (
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Renews</span>
                <span className="text-sm font-['Space_Grotesk'] text-[#3a3935]">{renewalDate}</span>
              </div>
            )}
          </div>

          {isPaid ? (
            <BillingPortalButton />
          ) : (
            <div className="space-y-3">
              <Alert title="You're on the free plan">
                Upgrade to Pro to unlock subscription tracking, overlap alerts, renewal reminders,
                and full quiz recommendations.
              </Alert>
              <Link href="/pricing">
                <Button variant="filled" size="sm">
                  Upgrade to Pro — $49/mo
                </Button>
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
