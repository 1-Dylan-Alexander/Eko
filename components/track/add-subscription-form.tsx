'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

interface AiTool {
  id: string
  name: string
  category: string
}

interface Props {
  tools: AiTool[]
}

export function AddSubscriptionForm({ tools }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    ai_tool_id: '',
    custom_tool_name: '',
    seats: '1',
    monthly_cost: '',
    next_renewal_date: '',
    notes: '',
  })

  const isCustom = form.ai_tool_id === '__custom__'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload: Record<string, unknown> = {
      seats: parseInt(form.seats) || 1,
      monthly_cost: parseFloat(form.monthly_cost) || 0,
      next_renewal_date: form.next_renewal_date || null,
      notes: form.notes || null,
    }

    if (isCustom) {
      payload.custom_tool_name = form.custom_tool_name
      payload.ai_tool_id = null
    } else if (form.ai_tool_id) {
      payload.ai_tool_id = form.ai_tool_id
    }

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to add subscription')
      }

      setForm({ ai_tool_id: '', custom_tool_name: '', seats: '1', monthly_cost: '', next_renewal_date: '', notes: '' })
      setOpen(false)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const labelClass = "block text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-1.5"
  const inputClass = "w-full px-3 py-2 text-sm font-['Space_Grotesk'] text-[#111110] bg-white border border-[#dddbd6] focus:outline-none focus:border-[#111110] transition-colors"

  return (
    <div>
      {!open ? (
        <Button variant="filled" size="sm" onClick={() => setOpen(true)}>
          + Add subscription
        </Button>
      ) : (
        <div className="border border-[#dddbd6] bg-white p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
              Add subscription
            </p>
            <button
              onClick={() => setOpen(false)}
              className="text-xs font-['Space_Mono'] text-[#7a7870] hover:text-[#111110] transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {/* Tool select */}
            <div className="col-span-2">
              <label className={labelClass}>Tool</label>
              <select
                value={form.ai_tool_id}
                onChange={(e) => setForm({ ...form, ai_tool_id: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Select a tool…</option>
                {tools.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.category}
                  </option>
                ))}
                <option value="__custom__">Other / custom tool</option>
              </select>
            </div>

            {/* Custom tool name */}
            {isCustom && (
              <div className="col-span-2">
                <label className={labelClass}>Custom tool name</label>
                <input
                  type="text"
                  value={form.custom_tool_name}
                  onChange={(e) => setForm({ ...form, custom_tool_name: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Internal AI assistant"
                  required
                />
              </div>
            )}

            {/* Seats */}
            <div>
              <label className={labelClass}>Seats</label>
              <input
                type="number"
                min="1"
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            {/* Monthly cost */}
            <div>
              <label className={labelClass}>Monthly cost ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.monthly_cost}
                onChange={(e) => setForm({ ...form, monthly_cost: e.target.value })}
                className={inputClass}
                placeholder="0.00"
                required
              />
            </div>

            {/* Renewal date */}
            <div>
              <label className={labelClass}>Next renewal date</label>
              <input
                type="date"
                value={form.next_renewal_date}
                onChange={(e) => setForm({ ...form, next_renewal_date: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>Notes (optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputClass}
                placeholder="Any context…"
              />
            </div>

            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <Button type="button" variant="outlined" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="filled" size="sm" loading={loading}>
                Add subscription
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
