'use client'

const TEAM_SIZES = [
  { value: '1-5', label: '1–5 people', description: 'Solo or very small team' },
  { value: '6-15', label: '6–15 people', description: 'Small team' },
  { value: '16-50', label: '16–50 people', description: 'Mid-size team' },
  { value: '51-100', label: '51–100 people', description: 'Larger team' },
  { value: '100+', label: '100+ people', description: 'Enterprise' },
]

interface Props {
  value: string
  onNext: (value: string) => void
  onBack: () => void
}

export function QuizStep2({ value, onNext, onBack }: Props) {
  return (
    <div>
      <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
        Question 2
      </p>
      <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#111110] mb-2">
        How large is your team?
      </h2>
      <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-8">
        Team size affects which pricing tiers and collaboration features matter most.
      </p>

      <div className="space-y-2 mb-8">
        {TEAM_SIZES.map((size) => (
          <button
            key={size.value}
            onClick={() => onNext(size.value)}
            className={[
              'w-full px-4 py-4 text-left border transition-colors flex items-center justify-between',
              value === size.value
                ? 'border-[#111110] bg-[#111110] text-white'
                : 'border-[#dddbd6] bg-white text-[#3a3935] hover:border-[#c8c5be] hover:bg-[#f9f8f6]',
            ].join(' ')}
          >
            <span className="font-['Space_Grotesk'] font-medium text-sm">
              {size.label}
            </span>
            <span
              className={[
                'text-xs font-[\'Space_Grotesk\']',
                value === size.value ? 'text-white/70' : 'text-[#7a7870]',
              ].join(' ')}
            >
              {size.description}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={onBack}
        className="text-sm font-['Space_Grotesk'] text-[#7a7870] hover:text-[#111110] transition-colors"
      >
        Back
      </button>
    </div>
  )
}
