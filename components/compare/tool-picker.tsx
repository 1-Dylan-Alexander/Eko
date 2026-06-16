'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'

interface AiTool {
  id: string
  name: string
  slug: string
  category: string
}

interface Props {
  tools: AiTool[]
  isPaid: boolean
}

export function ToolPicker({ tools, isPaid }: Props) {
  const router = useRouter()
  const [toolA, setToolA] = useState('')
  const [toolB, setToolB] = useState('')
  const [saving, setSaving] = useState(false)

  const selectedA = tools.find((t) => t.id === toolA)
  const selectedB = tools.find((t) => t.id === toolB)
  const canCompare = selectedA && selectedB && toolA !== toolB

  function handleCompare() {
    if (!selectedA || !selectedB) return
    router.push(`/compare/${selectedA.slug}-vs-${selectedB.slug}`)
  }

  async function handleSave() {
    if (!selectedA || !selectedB) return
    setSaving(true)
    try {
      const res = await fetch('/api/comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_ids: [selectedA.id, selectedB.id] }),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.refresh()
    } catch {
      alert('Failed to save comparison. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const selectClass =
    "w-full px-3 py-2.5 text-sm font-['Space_Grotesk'] text-[#111110] bg-white border border-[#dddbd6] focus:outline-none focus:border-[#111110] transition-colors"

  return (
    <div className="border border-[#dddbd6] bg-white p-6">
      <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
        Select two tools to compare
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-5">
        <select
          value={toolA}
          onChange={(e) => setToolA(e.target.value)}
          className={selectClass}
        >
          <option value="">Select first tool…</option>
          {tools.map((t) => (
            <option key={t.id} value={t.id} disabled={t.id === toolB}>
              {t.name} — {t.category}
            </option>
          ))}
        </select>

        <span className="text-xs font-['Space_Mono'] text-[#7a7870] px-2">vs</span>

        <select
          value={toolB}
          onChange={(e) => setToolB(e.target.value)}
          className={selectClass}
        >
          <option value="">Select second tool…</option>
          {tools.map((t) => (
            <option key={t.id} value={t.id} disabled={t.id === toolA}>
              {t.name} — {t.category}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="filled"
          size="sm"
          disabled={!canCompare}
          onClick={handleCompare}
        >
          Compare
        </Button>
        {isPaid && (
          <Button
            variant="outlined"
            size="sm"
            disabled={!canCompare || saving}
            loading={saving}
            onClick={handleSave}
          >
            Compare &amp; save
          </Button>
        )}
      </div>
    </div>
  )
}
