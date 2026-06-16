import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f5f4f1]">
      {/* Nav */}
      <header className="border-b border-[#dddbd6] bg-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-['Space_Grotesk'] font-semibold text-[#111110] text-lg tracking-tight">
            Ēko
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-sm font-['Space_Grotesk'] text-[#3a3935] hover:text-[#111110] transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/sign-in"
              className="text-sm font-['Space_Grotesk'] text-[#3a3935] hover:text-[#111110] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center px-4 py-2 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center px-3 py-1 border border-[#dddbd6] bg-white mb-8">
            <span className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
              AI Stack Command Center
            </span>
          </div>

          <h1 className="font-['Space_Grotesk'] text-5xl font-semibold text-[#111110] leading-tight mb-6">
            Discover, compare, and track your entire AI stack
          </h1>

          <p className="font-['Space_Grotesk'] text-lg text-[#3a3935] mb-10 leading-relaxed">
            Ēko gives your team one place to find the right AI tools, compare
            them side by side, and track every subscription — so nothing
            duplicates and nothing gets wasted.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center px-6 py-3 bg-[#111110] text-white font-['Space_Grotesk'] font-medium text-sm border border-[#111110] hover:bg-[#3a3935] transition-colors"
            >
              Start free
            </Link>
            <Link
              href="/audit"
              className="inline-flex items-center px-6 py-3 bg-transparent text-[#111110] font-['Space_Grotesk'] font-medium text-sm border border-[#dddbd6] hover:border-[#c8c5be] transition-colors"
            >
              Audit your stack — free
            </Link>
          </div>
        </div>

        {/* Three pillars */}
        <div className="mt-24 grid grid-cols-3 gap-px bg-[#dddbd6] border border-[#dddbd6]">
          {[
            {
              label: '01 — Discover',
              heading: 'Find the right tools',
              body: 'A guided quiz matches your team to the right AI tools based on workflows, industry, and budget.',
            },
            {
              label: '02 — Compare',
              heading: 'Decide with confidence',
              body: 'Side-by-side breakdowns with a clear Ēko verdict. No neutral lists — a real recommendation.',
            },
            {
              label: '03 — Track',
              heading: 'Own your subscriptions',
              body: 'Every tool your team pays for, the cost, renewal date, who uses it, and whether it earns its place.',
            },
          ].map((pillar) => (
            <div key={pillar.label} className="bg-white p-8">
              <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
                {pillar.label}
              </p>
              <h3 className="font-['Space_Grotesk'] text-lg font-semibold text-[#111110] mb-3">
                {pillar.heading}
              </h3>
              <p className="text-sm font-['Space_Grotesk'] text-[#3a3935] leading-relaxed">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
