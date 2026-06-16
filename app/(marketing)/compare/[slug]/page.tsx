import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { formatStartingPrice, formatPricingModel } from '@/lib/utils/format'
import type { Metadata } from 'next'
import type { Database } from '@/types/database'

type AiTool = Database['public']['Tables']['ai_tools']['Row']

interface Props {
  params: Promise<{ slug: string }>
}

function parseSlug(slug: string): [string, string] | null {
  // Expected format: tool-a-vs-tool-b
  const match = slug.match(/^(.+)-vs-(.+)$/)
  if (!match) return null
  return [match[1], match[2]]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) return { title: 'Compare AI Tools — Ēko' }

  const [slugA, slugB] = parsed
  const supabase = createServerClient()
  const { data: tools } = await supabase
    .from('ai_tools')
    .select('name')
    .in('slug', [slugA, slugB])

  if (!tools || tools.length < 2) return { title: 'Compare AI Tools — Ēko' }
  const [a, b] = tools
  return {
    title: `${a.name} vs ${b.name} — Ēko`,
    description: `Side-by-side comparison of ${a.name} and ${b.name}. See pricing, use cases, and get an Ēko verdict.`,
  }
}

export default async function PublicComparePage({ params }: Props) {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) notFound()

  const [slugA, slugB] = parsed
  const supabase = createServerClient()

  const { data: tools } = await supabase
    .from('ai_tools')
    .select('*')
    .in('slug', [slugA, slugB])
    .eq('is_active', true)

  if (!tools || tools.length < 2) notFound()

  const toolA = tools.find((t) => t.slug === slugA)
  const toolB = tools.find((t) => t.slug === slugB)
  if (!toolA || !toolB) notFound()

  // Generate a simple Ēko verdict based on data
  const verdict = generateVerdict(toolA, toolB)

  return (
    <div className="min-h-screen bg-[#f5f4f1]">
      {/* Nav */}
      <header className="border-b border-[#dddbd6] bg-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-['Space_Grotesk'] font-semibold text-[#111110] text-lg tracking-tight"
          >
            Ēko
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center px-4 py-2 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors"
          >
            Track your AI stack free
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-3">
            AI Tool Comparison
          </p>
          <h1 className="font-['Space_Grotesk'] text-3xl font-semibold text-[#111110]">
            {toolA.name} vs {toolB.name}
          </h1>
          <p className="mt-2 text-sm font-['Space_Grotesk'] text-[#7a7870]">
            Side-by-side breakdown to help you decide which tool is right for your team.
          </p>
        </div>

        {/* Comparison table */}
        <div className="border border-[#dddbd6] bg-white mb-8">
          {/* Header row */}
          <div className="grid grid-cols-3 border-b border-[#dddbd6]">
            <div className="px-6 py-4 border-r border-[#dddbd6]">
              <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
                Feature
              </p>
            </div>
            <div className="px-6 py-4 border-r border-[#dddbd6]">
              <p className="font-['Space_Grotesk'] font-semibold text-[#111110]">
                {toolA.name}
              </p>
              <p className="text-xs font-['Space_Grotesk'] text-[#7a7870] mt-0.5">
                {toolA.tagline}
              </p>
            </div>
            <div className="px-6 py-4">
              <p className="font-['Space_Grotesk'] font-semibold text-[#111110]">
                {toolB.name}
              </p>
              <p className="text-xs font-['Space_Grotesk'] text-[#7a7870] mt-0.5">
                {toolB.tagline}
              </p>
            </div>
          </div>

          {/* Category */}
          <CompareRow
            label="Category"
            a={toolA.category}
            b={toolB.category}
          />

          {/* Pricing model */}
          <CompareRow
            label="Pricing model"
            a={formatPricingModel(toolA.pricing_model)}
            b={formatPricingModel(toolB.pricing_model)}
          />

          {/* Starting price */}
          <CompareRow
            label="Starting price"
            a={formatStartingPrice(toolA.pricing_model, toolA.starting_price)}
            b={formatStartingPrice(toolB.pricing_model, toolB.starting_price)}
          />

          {/* Use cases */}
          <div className="grid grid-cols-3 border-b border-[#dddbd6] last:border-0">
            <div className="px-6 py-4 border-r border-[#dddbd6] bg-[#f9f8f6]">
              <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
                Use cases
              </p>
            </div>
            <div className="px-6 py-4 border-r border-[#dddbd6]">
              <div className="flex flex-wrap gap-1.5">
                {toolA.use_cases.map((uc) => (
                  <span
                    key={uc}
                    className="text-xs font-['Space_Mono'] text-[#3a3935] bg-[#f5f4f1] border border-[#dddbd6] px-2 py-0.5"
                  >
                    {uc}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex flex-wrap gap-1.5">
                {toolB.use_cases.map((uc) => (
                  <span
                    key={uc}
                    className="text-xs font-['Space_Mono'] text-[#3a3935] bg-[#f5f4f1] border border-[#dddbd6] px-2 py-0.5"
                  >
                    {uc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Shared use cases */}
          {(() => {
            const shared = toolA.use_cases.filter((uc) =>
              toolB.use_cases.includes(uc)
            )
            if (shared.length === 0) return null
            return (
              <div className="grid grid-cols-3 border-b border-[#dddbd6]">
                <div className="px-6 py-4 border-r border-[#dddbd6] bg-[#f9f8f6]">
                  <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
                    Overlap
                  </p>
                </div>
                <div className="col-span-2 px-6 py-4">
                  <p className="text-xs font-['Space_Grotesk'] text-[#b43c3c] mb-2">
                    Both tools cover {shared.length} of the same use {shared.length === 1 ? 'case' : 'cases'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {shared.map((uc) => (
                      <span
                        key={uc}
                        className="text-xs font-['Space_Mono'] text-[#b43c3c] bg-[rgba(180,60,60,0.08)] border border-[#b43c3c] px-2 py-0.5"
                      >
                        {uc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Ēko Verdict */}
        <div className="border border-[#dddbd6] border-l-[3px] border-l-[#111110] bg-white p-6 mb-10">
          <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-3">
            Ēko verdict
          </p>
          <p className="font-['Space_Grotesk'] text-[#111110] leading-relaxed">
            {verdict}
          </p>
        </div>

        {/* CTA */}
        <div className="border border-[#dddbd6] bg-white p-8 text-center">
          <p className="font-['Space_Grotesk'] font-semibold text-[#111110] mb-2">
            Already using one of these?
          </p>
          <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-6">
            Track it in Ēko alongside the rest of your team&apos;s AI subscriptions.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center px-6 py-3 bg-[#111110] text-white font-['Space_Grotesk'] font-medium text-sm border border-[#111110] hover:bg-[#3a3935] transition-colors"
          >
            Start tracking free
          </Link>
        </div>
      </main>
    </div>
  )
}

function CompareRow({
  label,
  a,
  b,
}: {
  label: string
  a: string
  b: string
}) {
  return (
    <div className="grid grid-cols-3 border-b border-[#dddbd6]">
      <div className="px-6 py-4 border-r border-[#dddbd6] bg-[#f9f8f6]">
        <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
          {label}
        </p>
      </div>
      <div className="px-6 py-4 border-r border-[#dddbd6]">
        <p className="text-sm font-['Space_Grotesk'] text-[#3a3935]">{a}</p>
      </div>
      <div className="px-6 py-4">
        <p className="text-sm font-['Space_Grotesk'] text-[#3a3935]">{b}</p>
      </div>
    </div>
  )
}

function generateVerdict(a: AiTool, b: AiTool): string {
  const sharedUseCases = a.use_cases.filter((uc) => b.use_cases.includes(uc))
  const sameCategory = a.category === b.category

  if (sameCategory && sharedUseCases.length >= 3) {
    return `${a.name} and ${b.name} serve almost identical purposes and your team likely does not need both. If budget is a constraint, compare seat pricing directly — both are in the ${a.category} category and overlap on ${sharedUseCases.length} use cases including ${sharedUseCases.slice(0, 2).join(' and ')}. Pick one and cancel the other.`
  }

  if (sharedUseCases.length > 0) {
    const aPrice = a.starting_price ?? 0
    const bPrice = b.starting_price ?? 0
    const cheaper = aPrice <= bPrice ? a : b
    const priceDiff = Math.abs(aPrice - bPrice)

    if (priceDiff > 0) {
      return `${a.name} and ${b.name} overlap on ${sharedUseCases.join(', ')} but serve different primary purposes. ${cheaper.name} is the more cost-effective choice if your primary need is ${sharedUseCases[0]}. Use both only if your team has distinct workflows that require each tool's unique capabilities.`
    }

    return `${a.name} and ${b.name} overlap on ${sharedUseCases.join(', ')}. Evaluate which one your team actually uses for these tasks and consider consolidating to avoid paying for duplicate functionality.`
  }

  return `${a.name} and ${b.name} serve different purposes and can reasonably coexist in a team's AI stack. ${a.name} is stronger for ${a.use_cases[0]} while ${b.name} is the better choice for ${b.use_cases[0]}. If your team needs both capabilities, there is no significant overlap to worry about.`
}
