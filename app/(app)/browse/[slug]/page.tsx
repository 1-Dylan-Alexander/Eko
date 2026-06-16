import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Badge, Button, PageHeader, Separator } from '@/components/ui'
import { formatStartingPrice, formatPricingModel } from '@/lib/utils/format'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServerClient()
  const { data: tool } = await supabase
    .from('ai_tools')
    .select('name, tagline')
    .eq('slug', slug)
    .single()

  if (!tool) return { title: 'Tool not found — Ēko' }
  return { title: `${tool.name} — Ēko` }
}

export default async function ToolPage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { slug } = await params
  const supabase = createServerClient()

  const { data: tool } = await supabase
    .from('ai_tools')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!tool) notFound()

  // Fetch related tools in same category
  const { data: related } = await supabase
    .from('ai_tools')
    .select('id, name, slug, tagline, category, pricing_model, starting_price')
    .eq('category', tool.category)
    .eq('is_active', true)
    .neq('slug', slug)
    .limit(3)

  const pricingBadgeVariant = (model: string) => {
    if (model === 'free') return 'green' as const
    if (model === 'enterprise') return 'amber' as const
    return 'default' as const
  }

  return (
    <div>
      <PageHeader
        title={tool.name}
        description={tool.tagline ?? undefined}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/compare?tools=${tool.slug}`}>
              <Button variant="outlined" size="sm">Compare</Button>
            </Link>
            {tool.website_url && (
              <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                <Button variant="filled" size="sm">Visit site</Button>
              </a>
            )}
          </div>
        }
      />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Main content */}
          <div className="col-span-2 space-y-8">
            {/* Description */}
            {tool.description && (
              <section>
                <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-3">
                  Overview
                </p>
                <p className="text-sm font-['Space_Grotesk'] text-[#3a3935] leading-relaxed">
                  {tool.description}
                </p>
              </section>
            )}

            <Separator />

            {/* Use cases */}
            <section>
              <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-3">
                Use cases
              </p>
              <div className="flex flex-wrap gap-2">
                {tool.use_cases.map((uc) => (
                  <span
                    key={uc}
                    className="text-xs font-['Space_Mono'] text-[#3a3935] bg-[#f5f4f1] border border-[#dddbd6] px-3 py-1.5"
                  >
                    {uc}
                  </span>
                ))}
              </div>
            </section>

            <Separator />

            {/* Related tools */}
            {related && related.length > 0 && (
              <section>
                <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-3">
                  Other tools in {tool.category}
                </p>
                <div className="border border-[#dddbd6] divide-y divide-[#dddbd6]">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/browse/${r.slug}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-[#f9f8f6] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-['Space_Grotesk'] font-medium text-[#111110]">
                          {r.name}
                        </p>
                        <p className="text-xs font-['Space_Grotesk'] text-[#7a7870]">
                          {r.tagline}
                        </p>
                      </div>
                      <span className="text-xs font-['Space_Mono'] text-[#7a7870]">
                        {formatStartingPrice(r.pricing_model, r.starting_price)}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick facts */}
            <div className="border border-[#dddbd6] bg-white">
              <div className="px-4 py-3 border-b border-[#dddbd6]">
                <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
                  Quick facts
                </p>
              </div>
              <div className="divide-y divide-[#dddbd6]">
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Category</span>
                  <Badge>{tool.category}</Badge>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Pricing</span>
                  <Badge variant={pricingBadgeVariant(tool.pricing_model)}>
                    {formatPricingModel(tool.pricing_model)}
                  </Badge>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-['Space_Mono'] text-[#7a7870]">Starting at</span>
                  <span className="text-xs font-['Space_Mono'] text-[#3a3935]">
                    {formatStartingPrice(tool.pricing_model, tool.starting_price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border border-[#dddbd6] bg-white p-4 space-y-2">
              <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-3">
                Actions
              </p>
              <Link href={`/compare?tools=${tool.slug}`} className="block">
                <Button variant="outlined" size="sm" className="w-full justify-center">
                  Add to comparison
                </Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button variant="outlined" size="sm" className="w-full justify-center">
                  Track this subscription
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
