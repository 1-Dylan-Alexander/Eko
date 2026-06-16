'use client'

import { useState } from 'react'

const USE_CASES = [
  { value: 'writing', label: 'Writing & editing' },
  { value: 'coding', label: 'Coding & development' },
  { value: 'research', label: 'Research & analysis' },
  { value: 'marketing', label: 'Marketing & content' },
  { value: 'customer-support', label: 'Customer support' },
  { value: 'sales', label: 'Sales & outreach' },
  { value: 'image-generation', label: 'Image generation' },
  { value: 'video-generation', label: 'Video creation' },
  { value: 'transcription', label: 'Meeting notes & transcription' },
  { value: 'summarization', label: 'Summarization' },
  { value: 'data-analysis', label: 'Data analysis' },
  { value: 'document-analysis', label: 'Document review' },
  { value: 'automation', label: 'Workflow automation' },
  { value: 'design', label: 'Design & creative' },
  { value: 'legal', label: 'Legal & compliance' },
]

interface Props {
  initial: string[]
  onNext: (value: string[]) => void
  onBack: () => void
}

export function QuizStep3({ initial, onNext, onBack }: Props) {
  const [selected, setSelected] = useState<string[]>(initial)

  function toggle(useCase: string) {
    setSelected((prev) =>
      prev.includes(useCase)
        ? prev.filter((v) => v !== useCase)
        : [...prev, useCase]
    )
  }

  return (
    <div>
      <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
        Question 3
      </p>
      <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#111110] mb-2">
        What does your team need AI for?
      </h2>
      <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-8">
        Select all that apply. Choose at least one.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-8">
        {USE_CASES.map((uc) => {
          const isSelected = selected.includes(uc.value)
          return (
            <button
              key={uc.value}
              onClick={() => toggle(uc.value)}
              className={[
                'px-4 py-3 text-left text-sm font-[\'Space_Grotesk\'] border transition-colors flex items-center gap-2',
                isSelected
                  ? 'border-[#111110] bg-[#111110] text-white'
                  : 'border-[#dddbd6] bg-white text-[#3a3935] hover:border-[#c8c5be] hover:bg-[#f9f8f6]',
              ].join(' ')}
            >
              <span
                className={[
                  'w-3.5 h-3.5 border shrink-0 flex items-center justify-center',
                  isSelected ? 'border-white' : 'border-[#c8c5be]',
                ].join(' ')}
              >
                {isSelected && <span className="w-2 h-2 bg-white block" />}
              </span>
              {uc.label}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => onNext(selected)}
          disabled={selected.length === 0}
          className="inline-flex items-center px-6 py-2.5 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue ({selected.length} selected)
        </button>
        <button
          onClick={onBack}
          className="text-sm font-['Space_Grotesk'] text-[#7a7870] hover:text-[#111110] transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  )
}
