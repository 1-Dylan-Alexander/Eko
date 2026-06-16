import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import { Badge } from '@/components/ui'
import { formatStartingPrice } from '@/lib/utils/format'
import { BrowseFilters } from '@/components/browse/browse-filters'

export const metadata = {
  title: 'Browse AI Tools — Ēko',
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; pricing?: string; q?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const params = await searchParams
  const supabase = createServerClient()

  // Fetch all active tools
  let query = supabase
    .from('ai_tools')
    .select('*')
    .eq('is_active', true)
    .order('name')

  const { data: tools, error } = await query

  if (error) {
    console.error('Error fetching tools:', JSON.stringify(error), error)
  }

  const allTools = tools ?? []

  // Get unique categories for filter
  const categories = Array.from(
    new Set(allTools.map((t) => t.category))
  ).sort()

  // Apply client-side filters (search, category, pricing)
  const filtered = allTools.filter((tool) => {
    const matchesCategory =
      !params.category || tool.category === params.category
    const matchesPricing =
      !params.pricing || tool.pricing_model === params.pricing
    const matchesSearch =
      !params.q ||
      tool.name.toLowerCase().includes(params.q.toLowerCase()) ||
      (tool.tagline?.toLowerCase().includes(params.q.toLowerCase()) ?? false) ||
      tool.category.toLowerCase().includes(params.q.toLowerCase())
    return matchesCategory && matchesPricing && matchesSearch
  })

  const pricingOptions = [
    { value: 'free', label: 'Free' },
    { value: 'freemium', label: 'Freemium' },
    { value: 'paid', label: 'Paid' },
    { value: 'enterprise', label: 'Enterprise' },
  ]

  return (
    <div>
      <PageHeader
        title="Browse AI Tools"
        description={`${allTools.length} tools across ${categories.length} categories`}
      />

      <div className="p-8">
        {/* Filters */}
        <BrowseFilters
          categories={categories}
          pricingOptions={pricingOptions}
          currentCategory={params.category}
          currentPricing={params.pricing}
          currentSearch={params.q}
        />

        {/* Results count */}
        <div className="mt-6 mb-4 flex items-center justify-between">
          <p className="text-xs font-['Space_Mono'] text-[#7a7870]">
            {filtered.length} {filtered.length === 1 ? 'tool' : 'tools'}
            {params.category ? ` in ${params.category}` : ''}
            {params.q ? ` matching "${params.q}"` : ''}
          </p>
        </div>

        {/* Tool grid */}
        {filtered.length === 0 ? (
          <div className="border border-[#dddbd6] bg-white p-12 text-center">
            <p className="text-sm font-['Space_Grotesk'] text-[#7a7870]">
              No tools match your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-[#dddbd6] border border-[#dddbd6]">
            {filtered.map((tool) => (
              <Link
                key={tool.id}
                href={`/browse/${tool.slug}`}
                className="bg-white hover:bg-[#f9f8f6] transition-colors block"
              >
                <div className="px-6 py-4 flex items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-['Space_Grotesk'] font-semibold text-[#111110] text-sm">
                        {tool.name}
                      </span>
                      <Badge>{tool.category}</Badge>
                    </div>
                    <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] truncate">
                      {tool.tagline}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tool.use_cases.slice(0, 4).map((uc) => (
                        <span
                          key={uc}
                          className="text-xs font-['Space_Mono'] text-[#7a7870] bg-[#f5f4f1] px-2 py-0.5"
                        >
                          {uc}
                        </span>
                      ))}
                      {tool.use_cases.length > 4 && (
                        <span className="text-xs font-['Space_Mono'] text-[#b0aea8]">
                          +{tool.use_cases.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-['Space_Mono'] text-[#3a3935]">
                      {formatStartingPrice(tool.pricing_model, tool.starting_price)}
                    </p>
                    <p className="text-xs font-['Space_Mono'] text-[#b0aea8] mt-0.5 capitalize">
                      {tool.pricing_model}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
