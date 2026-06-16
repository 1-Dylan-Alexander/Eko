'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/format'

interface AiTool {
  id: string
  name: string
  slug: string
  category: string
  logo_url: string | null
}

interface Subscription {
  id: string
  ai_tool_id: string | null
  custom_tool_name: string | null
  seats: number
  monthly_cost: number
  next_renewal_date: string | null
  notes: string | null
  ai_tools: AiTool | null
}

interface Props {
  subscriptions: Subscription[]
}

export function SubscriptionList({ subscriptions }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Remove this subscription?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.refresh()
    } catch {
      alert('Failed to remove subscription. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (subscriptions.length === 0) {
    return (
      <div className="border border-[#dddbd6] bg-white p-12 text-center">
        <p className="text-sm font-['Space_Grotesk'] text-[#7a7870]">
          No subscriptions yet. Add your first AI tool above.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-[#dddbd6] bg-white divide-y divide-[#dddbd6]">
      {/* Table header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-[#f5f4f1]">
        {['Tool', 'Category', 'Seats', 'Monthly cost', ''].map((h) => (
          <span key={h} className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
            {h}
          </span>
        ))}
      </div>

      {subscriptions.map((sub) => {
        const toolName = sub.ai_tools?.name ?? sub.custom_tool_name ?? 'Unknown tool'
        const category = sub.ai_tools?.category ?? 'Custom'
        const renewal = sub.next_renewal_date
          ? new Date(sub.next_renewal_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : null

        // Warn if renewal is within 14 days
        const daysUntilRenewal = sub.next_renewal_date
          ? Math.ceil(
              (new Date(sub.next_renewal_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
          : null

        const renewalSoon = daysUntilRenewal !== null && daysUntilRenewal <= 14 && daysUntilRenewal >= 0

        return (
          <div
            key={sub.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-[#faf9f7] transition-colors"
          >
            <div>
              <p className="text-sm font-['Space_Grotesk'] font-medium text-[#111110]">
                {toolName}
              </p>
              {renewal && (
                <p className={`text-xs font-['Space_Mono'] mt-0.5 ${renewalSoon ? 'text-[#b06b00]' : 'text-[#7a7870]'}`}>
                  {renewalSoon ? `Renews in ${daysUntilRenewal}d` : `Renews ${renewal}`}
                </p>
              )}
            </div>
            <span className="text-sm font-['Space_Grotesk'] text-[#3a3935] capitalize">
              {category}
            </span>
            <span className="text-sm font-['Space_Grotesk'] text-[#3a3935]">
              {sub.seats}
            </span>
            <span className="text-sm font-['Space_Mono'] text-[#111110]">
              {formatCurrency(sub.monthly_cost)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              loading={deletingId === sub.id}
              onClick={() => handleDelete(sub.id)}
              className="text-[#b43c3c] hover:text-[#b43c3c] hover:bg-[rgba(180,60,60,0.06)]"
            >
              Remove
            </Button>
          </div>
        )
      })}
    </div>
  )
}
