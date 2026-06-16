import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { PageHeader, Alert, Button } from '@/components/ui'
import { AddSubscriptionForm } from '@/components/track/add-subscription-form'
import { SubscriptionList } from '@/components/track/subscription-list'
import { planAtLeast } from '@/lib/utils/plan'
import { formatCurrency } from '@/lib/utils/format'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Track — Ēko' }

export default async function TrackPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()

  if (!profile) redirect('/sign-in')

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, teams(id, plan)')
    .eq('profile_id', profile.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  const team = membership?.teams as { id: string; plan: 'free' | 'pro' | 'enterprise' } | null
  const plan = team?.plan ?? 'free'
  const isPaid = planAtLeast(plan, 'pro')

  // Free plan gate
  if (!isPaid) {
    return (
      <div>
        <PageHeader title="Track" description="Monitor your team's AI subscriptions" />
        <div className="p-8 max-w-2xl">
          <Alert variant="amber" title="Pro feature">
            Subscription tracking is available on the Pro plan and above.
            Upgrade to add tools, track spend, and get overlap alerts.
          </Alert>
          <div className="mt-4">
            <Link href="/pricing">
              <Button variant="filled" size="sm">Upgrade to Pro — $49/mo</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const teamId = team!.id

  // Load subscriptions + tools + overlap alerts in parallel
  const [subsResult, toolsResult, alertsResult] = await Promise.all([
    supabase
      .from('team_subscriptions')
      .select('*, ai_tools(id, name, slug, category, logo_url)')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false }),
    supabase
      .from('ai_tools')
      .select('id, name, category')
      .eq('is_active', true)
      .order('name'),
    supabase
      .from('overlap_alerts')
      .select('*')
      .eq('team_id', teamId)
      .eq('is_dismissed', false)
      .order('created_at', { ascending: false }),
  ])

  const subscriptions = subsResult.data ?? []
  const tools = toolsResult.data ?? []
  const alerts = alertsResult.data ?? []

  // Summary stats
  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.monthly_cost, 0)
  const totalSeats = subscriptions.reduce((sum, s) => sum + s.seats, 0)

  return (
    <div>
      <PageHeader title="Track" description="Monitor your team's AI subscriptions and spend" />

      <div className="p-8 space-y-8">

        {/* Summary stats */}
        {subscriptions.length > 0 && (
          <div className="grid grid-cols-3 gap-px bg-[#dddbd6] border border-[#dddbd6]">
            <div className="bg-white px-6 py-5">
              <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-1">
                Monthly spend
              </p>
              <p className="text-2xl font-['Space_Grotesk'] font-semibold text-[#111110]">
                {formatCurrency(totalMonthly)}
              </p>
            </div>
            <div className="bg-white px-6 py-5">
              <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-1">
                Active tools
              </p>
              <p className="text-2xl font-['Space_Grotesk'] font-semibold text-[#111110]">
                {subscriptions.length}
              </p>
            </div>
            <div className="bg-white px-6 py-5">
              <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-1">
                Total seats
              </p>
              <p className="text-2xl font-['Space_Grotesk'] font-semibold text-[#111110]">
                {totalSeats}
              </p>
            </div>
          </div>
        )}

        {/* Overlap alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
              Overlap alerts
            </p>
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                variant={alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'amber' : 'default'}
                title={`Overlap detected — ${alert.overlap_category}`}
              >
                You have {alert.subscription_ids.length} tools in the{' '}
                <strong>{alert.overlap_category}</strong> category. Consider consolidating to
                reduce spend.
              </Alert>
            ))}
          </div>
        )}

        {/* Add subscription */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
              Subscriptions
            </p>
          </div>
          <AddSubscriptionForm tools={tools} />
        </div>

        {/* Subscription list */}
        <SubscriptionList subscriptions={subscriptions} />

      </div>
    </div>
  )
}
