'use client'

const BUDGETS = [
  { value: 'under-100', label: 'Under $100/mo', description: 'Just getting started' },
  { value: '100-500', label: '$100–$500/mo', description: 'Small team budget' },
  { value: '500-2000', label: '$500–$2,000/mo', description: 'Growing investment' },
  { value: '2000-plus', label: '$2,000+/mo', description: 'Serious AI budget' },
  { value: 'unknown', label: 'Not sure yet', description: 'Still evaluating' },
]

interface Props {
  value: string
  onNext: (value: string) => void
  onBack: () => void
}

export function QuizStep4({ value, onNext, onBack }: Props) {
  return (
    <div>
      <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
        Question 4
      </p>
      <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#111110] mb-2">
        What is your monthly AI tools budget?
      </h2>
      <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-8">
        We use this to filter out tools that are out of range for your team.
      </p>

      <div className="space-y-2 mb-8">
        {BUDGETS.map((budget) => (
          <button
            key={budget.value}
            onClick={() => onNext(budget.value)}
            className={[
              'w-full px-4 py-4 text-left border transition-colors flex items-center justify-between',
              value === budget.value
                ? 'border-[#111110] bg-[#111110] text-white'
                : 'border-[#dddbd6] bg-white text-[#3a3935] hover:border-[#c8c5be] hover:bg-[#f9f8f6]',
            ].join(' ')}
          >
            <span className="font-['Space_Grotesk'] font-medium text-sm">
              {budget.label}
            </span>
            <span
              className={[
                'text-xs font-[\'Space_Grotesk\']',
                value === budget.value ? 'text-white/70' : 'text-[#7a7870]',
              ].join(' ')}
            >
              {budget.description}
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
