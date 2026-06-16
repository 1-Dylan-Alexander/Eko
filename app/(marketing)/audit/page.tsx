import Link from 'next/link'
import { AuditTool } from '@/components/marketing/audit-tool'

export const metadata = {
  title: 'Free AI Stack Audit — Ēko',
  description:
    'Instantly see how much your team is spending on AI tools and where you have overlap. No sign-up required.',
}

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-[#f5f4f1]">
      {/* Nav */}
      <header className="border-b border-[#dddbd6] bg-white">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-['Space_Grotesk'] font-semibold text-[#111110] text-lg tracking-tight"
          >
            Ēko
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center px-4 py-2 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors"
          >
            Track your full stack
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-3">
            Free tool — no sign-up required
          </p>
          <h1 className="font-['Space_Grotesk'] text-3xl font-semibold text-[#111110] mb-3">
            Audit your AI stack
          </h1>
          <p className="text-sm font-['Space_Grotesk'] text-[#3a3935] leading-relaxed">
            Add the AI tools your team is paying for. We&apos;ll show you your total monthly spend and flag any overlap — in seconds.
          </p>
        </div>

        <AuditTool />

        {/* CTA */}
        <div className="mt-12 border border-[#dddbd6] bg-white p-8">
          <p className="font-['Space_Grotesk'] font-semibold text-[#111110] mb-2">
            Want to save this and track renewals?
          </p>
          <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-6">
            Ēko Pro tracks every subscription, alerts you to overlap, and reminds your team before renewals hit.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center px-6 py-2.5 bg-[#111110] text-white text-sm font-['Space_Grotesk'] font-medium border border-[#111110] hover:bg-[#3a3935] transition-colors"
          >
            Start tracking free
          </Link>
        </div>
      </main>
    </div>
  )
}
