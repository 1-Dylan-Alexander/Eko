'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ error, reset }: Props) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="p-8 max-w-md">
      <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
        Error
      </p>
      <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-[#111110] mb-3">
        Something went wrong
      </h2>
      <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-6">
        An unexpected error occurred on this page. The team has been notified.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center px-4 py-2 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="text-sm font-['Space_Grotesk'] text-[#3a3935] hover:text-[#111110] transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
