import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { QuizShell } from '@/components/quiz/quiz-shell'

export const metadata = {
  title: 'Find Your AI Tools — Ēko',
}

export default async function QuizPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="p-8">
      <div className="border-b border-[#dddbd6] pb-6 mb-10">
        <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#111110]">
          Find the right AI tools
        </h1>
        <p className="mt-1 text-sm font-['Space_Grotesk'] text-[#7a7870]">
          5 questions. Opinionated recommendations. No jargon.
        </p>
      </div>
      <QuizShell />
    </div>
  )
}
