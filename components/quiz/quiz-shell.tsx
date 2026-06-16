'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuizStep1 } from './steps/step-1-industry'
import { QuizStep2 } from './steps/step-2-team-size'
import { QuizStep3 } from './steps/step-3-use-cases'
import { QuizStep4 } from './steps/step-4-budget'
import { QuizStep5 } from './steps/step-5-current-tools'

export interface QuizAnswers {
  industry: string
  team_size: string
  primary_use_cases: string[]
  monthly_budget: string
  current_tools: string[]
}

const TOTAL_STEPS = 5

export function QuizShell() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({
    primary_use_cases: [],
    current_tools: [],
  })

  function next(patch: Partial<QuizAnswers>) {
    const updated = { ...answers, ...patch }
    setAnswers(updated)
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    } else {
      submit(updated as QuizAnswers)
    }
  }

  function back() {
    setStep((s) => Math.max(1, s - 1))
  }

  async function submit(final: QuizAnswers) {
    setLoading(true)
    try {
      // Ensure Clerk user is synced to Supabase profiles before submitting
      await fetch('/api/team/sync-profile', { method: 'POST' })

      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(final),
      })

      if (!res.ok) throw new Error('Submission failed')
      const { quizResponseId } = await res.json()
      router.push(`/results?q=${quizResponseId}`)
    } catch {
      setLoading(false)
      alert('Something went wrong. Please try again.')
    }
  }

  const progressPct = ((step - 1) / TOTAL_STEPS) * 100

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-['Space_Mono'] text-[#7a7870]">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="text-xs font-['Space_Mono'] text-[#7a7870]">
            {Math.round(progressPct)}% complete
          </span>
        </div>
        <div className="h-px bg-[#dddbd6]">
          <div
            className="h-px bg-[#111110] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      {step === 1 && (
        <QuizStep1
          value={answers.industry ?? ''}
          onNext={(v) => next({ industry: v })}
        />
      )}
      {step === 2 && (
        <QuizStep2
          value={answers.team_size ?? ''}
          onNext={(v) => next({ team_size: v })}
          onBack={back}
        />
      )}
      {step === 3 && (
        <QuizStep3
          initial={answers.primary_use_cases ?? []}
          onNext={(v) => next({ primary_use_cases: v })}
          onBack={back}
        />
      )}
      {step === 4 && (
        <QuizStep4
          value={answers.monthly_budget ?? ''}
          onNext={(v) => next({ monthly_budget: v })}
          onBack={back}
        />
      )}
      {step === 5 && (
        <QuizStep5
          value={answers.current_tools ?? []}
          onNext={(v) => next({ current_tools: v })}
          onBack={back}
          loading={loading}
        />
      )}
    </div>
  )
}
