'use client'

import { useState } from 'react'

const COMMON_TOOLS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'GitHub Copilot',
  'Cursor',
  'Midjourney',
  'Grammarly',
  'Notion AI',
  'Otter.ai',
  'Jasper',
  'Copy.ai',
  'Perplexity',
]

interface Props {
  value: string[]
  onNext: (value: string[]) => void
  onBack: () => void
  loading: boolean
}

export function QuizStep5({ value, onNext, onBack, loading }: Props) {
  const [selected, setSelected] = useState<string[]>(value)
  const [custom, setCustom] = useState('')

  function toggle(tool: string) {
    setSelected((prev) =>
      prev.includes(tool) ? prev.filter((v) => v !== tool) : [...prev, tool]
    )
  }

  function addCustom() {
    const trimmed = custom.trim()
    if (trimmed && !selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed])
    }
    setCustom('')
  }

  return (
    <div>
      <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
        Question 5
      </p>
      <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#111110] mb-2">
        Which AI tools is your team already using?
      </h2>
      <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-8">
        Optional. This helps us avoid recommending what you already have.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {COMMON_TOOLS.map((tool) => {
          const isSelected = selected.includes(tool)
          return (
            <button
              key={tool}
              onClick={() => toggle(tool)}
              className={[
                'px-3 py-2.5 text-sm font-[\'Space_Grotesk\'] border transition-colors flex items-center gap-2',
                isSelected
                  ? 'border-[#111110] bg-[#111110] text-white'
                  : 'border-[#dddbd6] bg-white text-[#3a3935] hover:border-[#c8c5be] hover:bg-[#f9f8f6]',
              ].join(' ')}
            >
              <span
                className={[
                  'w-3 h-3 border shrink-0 flex items-center justify-center',
                  isSelected ? 'border-white' : 'border-[#c8c5be]',
                ].join(' ')}
              >
                {isSelected && <span className="w-1.5 h-1.5 bg-white block" />}
              </span>
              {tool}
            </button>
          )
        })}
      </div>

      {/* Custom tool input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          placeholder="Add another tool..."
          className="flex-1 px-3 py-2 text-sm font-['Space_Grotesk'] border border-[#dddbd6] bg-white text-[#111110] placeholder:text-[#b0aea8] outline-none focus:border-[#111110] transition-colors"
        />
        <button
          onClick={addCustom}
          disabled={!custom.trim()}
          className="px-4 py-2 text-sm font-['Space_Grotesk'] border border-[#dddbd6] text-[#3a3935] hover:border-[#c8c5be] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>

      {/* Custom tools list */}
      {selected.filter((t) => !COMMON_TOOLS.includes(t)).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selected
            .filter((t) => !COMMON_TOOLS.includes(t))
            .map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-3 py-1 border border-[#111110] bg-[#111110] text-white text-xs font-['Space_Mono']"
              >
                {t}
                <button
                  onClick={() =>
                    setSelected((prev) => prev.filter((v) => v !== t))
                  }
                  className="text-white/70 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={() => onNext(selected)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {loading ? 'Finding your matches...' : 'See my recommendations'}
        </button>
        <button
          onClick={onBack}
          disabled={loading}
          className="text-sm font-['Space_Grotesk'] text-[#7a7870] hover:text-[#111110] transition-colors disabled:opacity-40"
        >
          Back
        </button>
      </div>
    </div>
  )
}
