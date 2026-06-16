import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f4f1] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
          404
        </p>
        <h1 className="font-['Space_Grotesk'] text-3xl font-semibold text-[#111110] mb-3">
          Page not found
        </h1>
        <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
