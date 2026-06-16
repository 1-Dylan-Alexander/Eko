'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-[#f5f4f1] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
            Error
          </p>
          <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#111110] mb-3">
            Something went wrong
          </h1>
          <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-8">
            An unexpected error occurred. The team has been notified.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center px-5 py-2.5 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
