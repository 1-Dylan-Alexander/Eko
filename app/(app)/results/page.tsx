import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { formatStartingPrice } from '@/lib/utils/format'
import type { Database } from '@/types/database'

type AiTool = Database['public']['Tables']['ai_tools']['Row']

export const metadata = { title: 'Your AI Recommendations — Ēko' }

const BUDGET_MAX: Record<string, number> = {
  'under-100': 100,
  '100-500': 500,
  '500-2000': 2000,
  '2000-plus': 99999,
  'unknown': 99999,
}

function scoreTools(
  tools: AiTool[],
  useCases: string[],
  budget: string,
  currentTools: string[]
): Array<{ tool: AiTool; score: number; reasons: string[] }> {
  const maxBudget = BUDGET_MAX[budget] ?? 99999

  return tools
    .filter((tool) => {
      if (tool.pricing_model === 'enterprise') return maxBudget >= 2000
      if (tool.starting_price === null) return true
      return tool.starting_price <= maxBudget
    })
    .filter((tool) => {
      // Exclude tools already in use (by name match)
      return !currentTools.some(
        (ct) => ct.toLowerCase() === tool.name.toLowerCase()
      )
    })
    .map((tool) => {
      const reasons: string[] = []
      let score = 0

      // Score by use case overlap
      const overlap = tool.use_cases.filter((uc) => useCases.includes(uc))
      score += overlap.length * 10
      if (overlap.length > 0) {
        reasons.push(
          `Covers ${overlap.length} of your requested use ${overlap.length === 1 ? 'case' : 'cases'}: ${overlap.slice(0, 2).join(', ')}`
        )
      }

      // Bonus for freemium/free (lower risk)
      if (tool.pricing_model === 'freemium') {
        score += 3
        reasons.push('Free tier available — low risk to trial')
      }
      if (tool.pricing_model === 'free') {
        score += 5
        reasons.push('Completely free')
      }

      return { tool, score, reasons }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const params = await searchParams
  if (!params.q) notFound()

  const supabase = createServerClient()

  // Load quiz response
  const { data: quizResponse } = await supabase
    .from('quiz_responses')
    .select('*')
    .eq('id', params.q)
    .single()

  if (!quizResponse) notFound()

  // Load all active tools
  const { data: allTools } = await supabase
    .from('ai_tools')
    .select('*')
    .eq('is_active', true)

  if (!allTools) notFound()

  const scored = scoreTools(
    allTools,
    quizResponse.primary_use_cases,
    quizResponse.monthly_budget ?? 'unknown',
    quizResponse.current_tools
  )

  const topFree = scored.slice(0, 1)       // First result — free for everyone
  const paywalled = scored.slice(1, 6)      // Remaining top 5 — Pro only

  // Check if user has a pro plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()

  const { data: membership } = profile
    ? await supabase
        .from('team_members')
        .select('team_id, teams(plan)')
        .eq('profile_id', profile.id)
        .eq('status', 'active')
        .limit(1)
        .single()
    : { data: null }

  const plan =
    (membership?.teams as { plan?: string } | null)?.plan ?? 'free'
  const isPro = plan === 'pro' || plan === 'enterprise'

  return (
    <div className="p-8 max-w-3xl">
      <div className="border-b border-[#dddbd6] pb-6 mb-8">
        <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#111110]">
          Your recommendations
        </h1>
        <p className="mt-1 text-sm font-['Space_Grotesk'] text-[#7a7870]">
          Based on your answers — {quizResponse.industry},{' '}
          {quizResponse.team_size} people,{' '}
          {quizResponse.primary_use_cases.slice(0, 2).join(' & ')}
        </p>
      </div>

      {scored.length === 0 ? (
        <div className="border border-[#dddbd6] bg-white p-8 text-center">
          <p className="text-sm font-['Space_Grotesk'] text-[#7a7870]">
            No tools matched your criteria. Try adjusting your budget or use cases.
          </p>
          <Link
            href="/quiz"
            className="inline-flex mt-4 px-4 py-2 bg-[#111110] text-white text-sm font-['Space_Grotesk'] border border-[#111110] hover:bg-[#3a3935] transition-colors"
          >
            Retake quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-px">
          {/* Top result — always visible */}
          {topFree.map(({ tool, score, reasons }, i) => (
            <RecommendationCard
              key={tool.id}
              tool={tool}
              rank={i + 1}
              reasons={reasons}
              score={score}
              isTop
            />
          ))}

          {/* Remaining results — paywalled */}
          {paywalled.length > 0 && (
            <>
              {isPro ? (
                paywalled.map(({ tool, score, reasons }, i) => (
                  <RecommendationCard
                    key={tool.id}
                    tool={tool}
                    rank={i + 2}
                    reasons={reasons}
                    score={score}
                  />
                ))
              ) : (
                <div className="border border-[#dddbd6] bg-white">
                  {/* Blurred previews */}
                  {paywalled.slice(0, 3).map(({ tool }, i) => (
                    <div
                      key={tool.id}
                      className="px-6 py-5 border-b border-[#dddbd6] last:border-0 select-none"
                      style={{ filter: 'blur(4px)', pointerEvents: 'none' }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-['Space_Grotesk'] font-semibold text-[#111110]">
                            #{i + 2} — {tool.name}
                          </p>
                          <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mt-0.5">
                            {tool.tagline}
                          </p>
                        </div>
                        <span className="text-sm font-['Space_Mono'] text-[#3a3935]">
                          {formatStartingPrice(tool.pricing_model, tool.starting_price)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Paywall CTA */}
                  <div className="px-6 py-8 text-center border-t border-[#dddbd6] bg-[#f9f8f6]">
                    <p className="font-['Space_Grotesk'] font-semibold text-[#111110] mb-1">
                      {paywalled.length} more recommendations waiting
                    </p>
                    <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-6">
                      Upgrade to Ēko Pro to see all matches, plus track your team&apos;s subscriptions and get overlap alerts.
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center px-6 py-2.5 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors"
                    >
                      Upgrade to Pro — $49/mo
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/quiz"
          className="text-sm font-['Space_Grotesk'] text-[#7a7870] hover:text-[#111110] transition-colors"
        >
          Retake quiz
        </Link>
        <Link
          href="/browse"
          className="text-sm font-['Space_Grotesk'] text-[#7a7870] hover:text-[#111110] transition-colors"
        >
          Browse all tools
        </Link>
      </div>
    </div>
  )
}

function RecommendationCard({
  tool,
  rank,
  reasons,
  isTop = false,
}: {
  tool: AiTool
  rank: number
  reasons: string[]
  score: number
  isTop?: boolean
}) {
  return (
    <div
      className={[
        'border border-[#dddbd6] bg-white px-6 py-5',
        isTop ? 'border-l-[3px] border-l-[#1d7a4f]' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-['Space_Mono'] text-[#7a7870]">
              #{rank}
            </span>
            <h3 className="font-['Space_Grotesk'] font-semibold text-[#111110]">
              {tool.name}
            </h3>
            {isTop && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-['Space_Mono'] text-[#1d7a4f] bg-[rgba(29,122,79,0.08)] border border-[#1d7a4f]">
                Best match
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-['Space_Mono'] text-[#7a7870] border border-[#dddbd6]">
              {tool.category}
            </span>
          </div>
          <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-3">
            {tool.tagline}
          </p>
          {reasons.length > 0 && (
            <ul className="space-y-1">
              {reasons.map((r) => (
                <li
                  key={r}
                  className="text-xs font-['Space_Grotesk'] text-[#3a3935] flex items-start gap-2"
                >
                  <span className="text-[#1d7a4f] mt-0.5">+</span>
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-['Space_Mono'] text-[#3a3935]">
            {formatStartingPrice(tool.pricing_model, tool.starting_price)}
          </p>
          <Link
            href={`/browse/${tool.slug}`}
            className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-['Space_Grotesk'] border border-[#dddbd6] text-[#3a3935] hover:border-[#c8c5be] transition-colors"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  )
}
