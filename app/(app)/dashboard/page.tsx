import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Badge, Alert } from '@/components/ui'
import { planAtLeast } from '@/lib/utils/plan'
import { formatCurrency } from '@/lib/utils/format'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — Ēko' }

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('clerk_user_id', userId)
    .single()

  const { data: membership } = profile
    ? await supabase
        .from('team_members')
        .select('teams(id, name, plan, plan_expires_at)')
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
  } | null

  const plan = team?.plan ?? 'free'
  const isPaid = planAtLeast(plan, 'pro')

  const [subsResult, alertsResult] = team && isPaid
    ? await Promise.all([
        supabase
          .from('team_subscriptions')
          .select('id, monthly_cost, ai_tools(name, category)')
          .eq('team_id', team.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('overlap_alerts')
          .select('id, overlap_category, severity')
          .eq('team_id', team.id)
          .eq('is_dismissed', false),
      ])
    : [{ data: [] }, { data: [] }]

  const recentSubs = subsResult.data ?? []
  const alerts = alertsResult.data ?? []
  const totalMonthly = recentSubs.reduce((sum, s) => sum + s.monthly_cost, 0)

  const planLabel: Record<string, string> = { free: 'Free', pro: 'Pro Team', enterprise: 'Enterprise' }
  const planBadgeVariant = (p: string) =>
    p === 'free' ? 'default' as const : p === 'enterprise' ? 'amber' as const : 'green' as const

  return (
    <div className="p-8">
      {/* Header */}
      <div className="border-b border-[#dddbd6] pb-6 mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#111110]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm font-['Space_Grotesk'] text-[#7a7870]">
            {team ? team.name : 'Your AI stack command center'}
          </p>
        </div>
        <Badge variant={planBadgeVariant(plan)}>{planLabel[plan]}</Badge>
      </div>

      {/* Upgrade prompt for free users */}
      {!isPaid && (
        <div className="mb-8">
          <Alert title="You're on the free plan">
            <Link href="/pricing" className="underline underline-offset-2 hover:opacity-80">
              Upgrade to Pro
            </Link>{' '}
            to track subscriptions, detect overlaps, and get renewal reminders.
          </Alert>
        </div>
      )}

      {/* Stats grid */}
      {isPaid && (
        <div className="grid grid-cols-3 gap-px bg-[#dddbd6] border border-[#dddbd6] mb-8">
          <div className="bg-white px-6 py-5">
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-1">Monthly spend</p>
            <p className="text-2xl font-['Space_Grotesk'] font-semibold text-[#111110]">{formatCurrency(totalMonthly)}</p>
          </div>
          <div className="bg-white px-6 py-5">
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-1">Active tools</p>
            <p className="text-2xl font-['Space_Grotesk'] font-semibold text-[#111110]">{recentSubs.length}</p>
          </div>
          <div className="bg-white px-6 py-5">
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-1">Overlap alerts</p>
            <p className={`text-2xl font-['Space_Grotesk'] font-semibold ${alerts.length > 0 ? 'text-[#b43c3c]' : 'text-[#111110]'}`}>
              {alerts.length}
            </p>
          </div>
        </div>
      )}

      {/* Overlap alerts */}
      {alerts.length > 0 && (
        <div className="mb-8 space-y-2">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.severity === 'high' ? 'red' : 'amber'}
              title={`Overlap — ${alert.overlap_category}`}
            >
              Multiple tools in the same category.{' '}
              <Link href="/track" className="underline underline-offset-2">View in Track</Link>
            </Alert>
          ))}
        </div>
      )}

      {/* Recent subscriptions */}
      {isPaid && recentSubs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">Recent subscriptions</p>
            <Link href="/track" className="text-xs font-['Space_Mono'] text-[#3a3935] hover:text-[#111110] underline underline-offset-2 transition-colors">
              View all
            </Link>
          </div>
          <div className="border border-[#dddbd6] bg-white divide-y divide-[#dddbd6]">
            {recentSubs.map((sub) => {
              const tool = sub.ai_tools as { name: string; category: string } | null
              return (
                <div key={sub.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-['Space_Grotesk'] text-[#111110]">{tool?.name ?? 'Custom tool'}</p>
                    <p className="text-xs font-['Space_Mono'] text-[#7a7870] capitalize">{tool?.category ?? '—'}</p>
                  </div>
                  <span className="text-sm font-['Space_Mono'] text-[#111110]">{formatCurrency(sub.monthly_cost)}/mo</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {isPaid && recentSubs.length === 0 && (
        <div className="border border-[#dddbd6] bg-white p-10 text-center">
          <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-4">No subscriptions tracked yet.</p>
          <Link href="/track" className="inline-flex items-center px-4 py-2 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors">
            Add your first subscription
          </Link>
        </div>
      )}
    </div>
  )
}
