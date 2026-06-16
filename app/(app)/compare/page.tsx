import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui'
import { ToolPicker } from '@/components/compare/tool-picker'
import { planAtLeast } from '@/lib/utils/plan'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Compare — Ēko' }

export default async function ComparePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()

  const { data: membership } = profile
    ? await supabase
        .from('team_members')
        .select('team_id, teams(id, plan)')
        .eq('profile_id', profile.id)
        .eq('status', 'active')
        .limit(1)
        .single()
    : { data: null }

  const team = membership?.teams as { id: string; plan: 'free' | 'pro' | 'enterprise' } | null
  const isPaid = planAtLeast(team?.plan ?? 'free', 'pro')

  const [toolsResult, savedResult] = await Promise.all([
    supabase
      .from('ai_tools')
      .select('id, name, slug, category')
      .eq('is_active', true)
      .order('name'),
    team && isPaid
      ? supabase
          .from('team_comparisons')
          .select('id, name, tool_ids, created_at')
          .eq('team_id', team.id)
          .order('created_at', { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] }),
  ])

  const tools = toolsResult.data ?? []
  const saved = savedResult.data ?? []

  // Resolve tool names for saved comparisons
  const allToolIds = [...new Set(saved.flatMap((c) => c.tool_ids))]
  const { data: toolNames } = allToolIds.length > 0
    ? await supabase
        .from('ai_tools')
        .select('id, name, slug')
        .in('id', allToolIds)
    : { data: [] }

  const toolMap = Object.fromEntries((toolNames ?? []).map((t) => [t.id, t]))

  return (
    <div>
      <PageHeader
        title="Compare"
        description="Side-by-side AI tool comparisons to help your team decide"
      />

      <div className="p-8 space-y-8 max-w-4xl">

        {/* Tool picker */}
        <ToolPicker tools={tools} isPaid={isPaid} />

        {/* Popular comparisons */}
        <div>
          <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-3">
            Popular comparisons
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['chatgpt', 'claude', 'ChatGPT vs Claude'],
              ['github-copilot', 'cursor', 'GitHub Copilot vs Cursor'],
              ['midjourney', 'dall-e', 'Midjourney vs DALL-E'],
              ['notion-ai', 'jasper', 'Notion AI vs Jasper'],
              ['perplexity', 'chatgpt', 'Perplexity vs ChatGPT'],
              ['grammarly', 'jasper', 'Grammarly vs Jasper'],
            ].map(([a, b, label]) => (
              <Link
                key={label}
                href={`/compare/${a}-vs-${b}`}
                className="px-4 py-3 border border-[#dddbd6] bg-white text-sm font-['Space_Grotesk'] text-[#3a3935] hover:text-[#111110] hover:border-[#c8c5be] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Saved comparisons (Pro) */}
        {isPaid && saved.length > 0 && (
          <div>
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-3">
              Saved by your team
            </p>
            <div className="border border-[#dddbd6] bg-white divide-y divide-[#dddbd6]">
              {saved.map((comp) => {
                const toolList = comp.tool_ids
                  .map((id: string) => toolMap[id]?.name ?? 'Unknown')
                  .join(' vs ')
                const slugPair = comp.tool_ids
                  .map((id: string) => toolMap[id]?.slug ?? '')
                  .filter(Boolean)
                  .join('-vs-')

                return (
                  <div key={comp.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-['Space_Grotesk'] text-[#111110]">
                        {comp.name ?? toolList}
                      </p>
                      <p className="text-xs font-['Space_Mono'] text-[#7a7870] mt-0.5">
                        {new Date(comp.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    {slugPair && (
                      <Link
                        href={`/compare/${slugPair}`}
                        className="text-xs font-['Space_Mono'] text-[#3a3935] hover:text-[#111110] underline underline-offset-2 transition-colors"
                      >
                        View
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
