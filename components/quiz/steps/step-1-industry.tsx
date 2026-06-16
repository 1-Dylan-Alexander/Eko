'use client'

const INDUSTRIES = [
  'Marketing & Advertising',
  'Software & Technology',
  'Finance & Accounting',
  'Legal & Compliance',
  'Sales & Business Development',
  'HR & People Operations',
  'Customer Support',
  'Design & Creative',
  'Healthcare',
  'Education & Training',
  'Operations & Logistics',
  'Other',
]

interface Props {
  value: string
  onNext: (value: string) => void
}

export function QuizStep1({ value, onNext }: Props) {
  return (
    <div>
      <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
        Question 1
      </p>
      <h2 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#111110] mb-2">
        What industry is your team in?
      </h2>
      <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-8">
        This helps us recommend tools that are proven in your field.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {INDUSTRIES.map((industry) => (
          <button
            key={industry}
            onClick={() => onNext(industry)}
            className={[
              'px-4 py-3 text-left text-sm font-[\'Space_Grotesk\'] border transition-colors',
              value === industry
                ? 'border-[#111110] bg-[#111110] text-white'
                : 'border-[#dddbd6] bg-white text-[#3a3935] hover:border-[#c8c5be] hover:bg-[#f9f8f6]',
            ].join(' ')}
          >
            {industry}
          </button>
        ))}
      </div>
    </div>
  )
}
