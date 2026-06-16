'use client'

import { useState } from 'react'

interface AuditEntry {
  id: string
  name: string
  cost: number
  category: string
}

const COMMON_TOOLS = [
  { name: 'ChatGPT', category: 'Writing & Productivity' },
  { name: 'Claude', category: 'Writing & Productivity' },
  { name: 'Gemini', category: 'Writing & Productivity' },
  { name: 'GitHub Copilot', category: 'Coding' },
  { name: 'Cursor', category: 'Coding' },
  { name: 'Midjourney', category: 'Image Generation' },
  { name: 'Grammarly', category: 'Writing & Productivity' },
  { name: 'Notion AI', category: 'Knowledge Management' },
  { name: 'Otter.ai', category: 'Meetings & Transcription' },
  { name: 'Jasper', category: 'Marketing' },
  { name: 'Copy.ai', category: 'Marketing' },
  { name: 'Perplexity', category: 'Research' },
]

function detectOverlap(entries: AuditEntry[]): string[] {
  const categoryGroups: Record<string, AuditEntry[]> = {}
  for (const entry of entries) {
    if (!categoryGroups[entry.category]) {
      categoryGroups[entry.category] = []
    }
    categoryGroups[entry.category].push(entry)
  }

  const overlaps: string[] = []
  for (const [category, tools] of Object.entries(categoryGroups)) {
    if (tools.length >= 2) {
      overlaps.push(
        `${tools.map((t) => t.name).join(' and ')} both cover ${category}`
      )
    }
  }
  return overlaps
}

export function AuditTool() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [category, setCategory] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const CATEGORIES = [
    'Writing & Productivity',
    'Coding',
    'Image Generation',
    'Video & Media',
    'Audio & Voice',
    'Meetings & Transcription',
    'Knowledge Management',
    'Research',
    'Marketing',
    'Sales & CRM',
    'Customer Support',
    'Legal',
    'Other',
  ]

  function addEntry() {
    const costNum = parseFloat(cost)
    if (!name.trim() || isNaN(costNum) || !category) return

    setEntries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        cost: costNum,
        category,
      },
    ])
    setName('')
    setCost('')
    setCategory('')
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  function selectSuggestion(tool: { name: string; category: string }) {
    setName(tool.name)
    setCategory(tool.category)
    setShowSuggestions(false)
  }

  const totalMonthly = entries.reduce((sum, e) => sum + e.cost, 0)
  const totalAnnual = totalMonthly * 12
  const overlaps = detectOverlap(entries)

  const filteredSuggestions = COMMON_TOOLS.filter(
    (t) =>
      name.length > 0 &&
      t.name.toLowerCase().includes(name.toLowerCase()) &&
      !entries.some((e) => e.name.toLowerCase() === t.name.toLowerCase())
  )

  return (
    <div>
      {/* Add tool form */}
      <div className="border border-[#dddbd6] bg-white p-6 mb-px">
        <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
          Add a tool
        </p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="relative col-span-1">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setShowSuggestions(true)
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Tool name"
              className="w-full px-3 py-2 text-sm font-['Space_Grotesk'] border border-[#dddbd6] bg-white text-[#111110] placeholder:text-[#b0aea8] outline-none focus:border-[#111110] transition-colors"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 border border-[#dddbd6] bg-white shadow-sm mt-px">
                {filteredSuggestions.map((t) => (
                  <button
                    key={t.name}
                    onMouseDown={() => selectSuggestion(t)}
                    className="w-full px-3 py-2 text-left text-sm font-['Space_Grotesk'] text-[#3a3935] hover:bg-[#f9f8f6] transition-colors"
                  >
                    {t.name}
                    <span className="text-xs text-[#b0aea8] ml-2">
                      {t.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-['Space_Mono'] text-[#7a7870]">
              $
            </span>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="Monthly cost"
              min="0"
              step="0.01"
              className="w-full pl-7 pr-3 py-2 text-sm font-['Space_Grotesk'] border border-[#dddbd6] bg-white text-[#111110] placeholder:text-[#b0aea8] outline-none focus:border-[#111110] transition-colors"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 text-sm font-['Space_Grotesk'] border border-[#dddbd6] bg-white text-[#111110] outline-none focus:border-[#111110] transition-colors"
          >
            <option value="">Category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addEntry}
          disabled={!name.trim() || !cost || !category}
          className="inline-flex items-center px-4 py-2 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add tool
        </button>
      </div>

      {/* Entries list */}
      {entries.length > 0 && (
        <>
          <div className="border border-[#dddbd6] border-t-0 bg-white divide-y divide-[#dddbd6] mb-px">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="px-6 py-3 flex items-center justify-between"
              >
                <div>
                  <span className="text-sm font-['Space_Grotesk'] font-medium text-[#111110]">
                    {entry.name}
                  </span>
                  <span className="text-xs font-['Space_Mono'] text-[#7a7870] ml-3">
                    {entry.category}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-['Space_Mono'] text-[#3a3935]">
                    ${entry.cost.toFixed(2)}/mo
                  </span>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-xs font-['Space_Mono'] text-[#b0aea8] hover:text-[#b43c3c] transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border border-[#dddbd6] border-t-0 bg-[#f9f8f6] px-6 py-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
                Monthly total
              </span>
              <span className="font-['Space_Grotesk'] font-semibold text-[#111110]">
                ${totalMonthly.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
                Annual total
              </span>
              <span className="font-['Space_Grotesk'] font-semibold text-[#111110]">
                ${totalAnnual.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Overlap alerts */}
          {overlaps.length > 0 && (
            <div className="mt-4 border border-[#b43c3c] border-l-[3px] bg-white px-5 py-4">
              <p className="text-xs font-['Space_Mono'] text-[#b43c3c] uppercase tracking-wider mb-3">
                Overlap detected
              </p>
              <ul className="space-y-2">
                {overlaps.map((o) => (
                  <li
                    key={o}
                    className="text-sm font-['Space_Grotesk'] text-[#b43c3c] flex items-start gap-2"
                  >
                    <span className="shrink-0 mt-0.5">!</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {entries.length === 0 && (
        <div className="border border-[#dddbd6] border-t-0 bg-white px-6 py-12 text-center">
          <p className="text-sm font-['Space_Grotesk'] text-[#b0aea8]">
            Add your first tool above to see your spend total.
          </p>
        </div>
      )}
    </div>
  )
}
