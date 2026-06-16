import Link from 'next/link'
import { PricingCheckoutButton } from '@/components/marketing/pricing-checkout-button'

export const metadata = {
  title: 'Pricing — Ēko',
  description: 'Simple, transparent pricing for teams that are serious about their AI stack.',
}

const PRO_PRICE_ID = 'price_1Tf2DfBy8Sd2wzDRC2KmRsCU'
const ENTERPRISE_PRICE_ID = 'price_1Tf2EABy8Sd2wzDRnH9KOJup'

const proFeatures = [
  'Full quiz recommendations (top 5 matches)',
  'Unlimited subscription tracking',
  'Overlap detection alerts',
  'Renewal reminder emails',
  'Side-by-side tool comparisons',
  'Save and export comparisons as PDF',
  'Up to 25 team members',
  'Audit log',
]

const enterpriseFeatures = [
  'Everything in Pro',
  'Unlimited team members',
  'Priority support',
  'Custom onboarding',
  'SSO (coming soon)',
  'Advanced reporting (coming soon)',
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f5f4f1]">
      {/* Nav */}
      <header className="border-b border-[#dddbd6] bg-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="font-['Space_Grotesk'] font-semibold text-[#111110] text-lg tracking-tight"
          >
            Ēko
          </Link>
          <div className="flex items-center gap-4">
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
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
            Pricing
          </p>
          <h1 className="font-['Space_Grotesk'] text-4xl font-semibold text-[#111110] mb-4">
            Simple pricing for serious teams
          </h1>
          <p className="text-base font-['Space_Grotesk'] text-[#3a3935] max-w-xl mx-auto">
            Start free. Upgrade when your team is ready to track, compare, and optimize your full AI stack.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-3 gap-px bg-[#dddbd6] border border-[#dddbd6]">
          {/* Free */}
          <div className="bg-white p-8">
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
              Free
            </p>
            <div className="mb-6">
              <span className="font-['Space_Grotesk'] text-4xl font-semibold text-[#111110]">
                $0
              </span>
              <span className="text-sm font-['Space_Grotesk'] text-[#7a7870] ml-1">
                /month
              </span>
            </div>
            <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-8">
              Get started and see your top recommendation.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex w-full items-center justify-center px-4 py-2.5 bg-transparent text-[#111110] text-sm font-['Space_Grotesk'] font-medium border border-[#dddbd6] hover:border-[#c8c5be] transition-colors mb-8"
            >
              Get started free
            </Link>
            <ul className="space-y-3">
              {[
                'AI tool discovery quiz',
                'Top 1 recommendation',
                'Browse all 20 tools',
                'Free AI stack audit tool',
                'Public comparison pages',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm font-['Space_Grotesk'] text-[#3a3935]">
                  <span className="text-[#7a7870] mt-0.5 shrink-0">–</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="bg-white p-8 border-x border-[#dddbd6]">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider">
                Pro Team
              </p>
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-['Space_Mono'] text-[#1d7a4f] bg-[rgba(29,122,79,0.08)] border border-[#1d7a4f]">
                Most popular
              </span>
            </div>
            <div className="mb-6">
              <span className="font-['Space_Grotesk'] text-4xl font-semibold text-[#111110]">
                $49
              </span>
              <span className="text-sm font-['Space_Grotesk'] text-[#7a7870] ml-1">
                /month
              </span>
            </div>
            <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-8">
              Everything your team needs to own its AI stack.
            </p>
            <PricingCheckoutButton
              priceId={PRO_PRICE_ID}
              label="Start Pro — $49/mo"
              className="w-full mb-8"
            />
            <ul className="space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm font-['Space_Grotesk'] text-[#3a3935]">
                  <span className="text-[#1d7a4f] mt-0.5 shrink-0">+</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise */}
          <div className="bg-white p-8">
            <p className="text-xs font-['Space_Mono'] text-[#7a7870] uppercase tracking-wider mb-4">
              Enterprise
            </p>
            <div className="mb-6">
              <span className="font-['Space_Grotesk'] text-4xl font-semibold text-[#111110]">
                $149
              </span>
              <span className="text-sm font-['Space_Grotesk'] text-[#7a7870] ml-1">
                /month
              </span>
            </div>
            <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] mb-8">
              For larger teams with advanced needs.
            </p>
            <PricingCheckoutButton
              priceId={ENTERPRISE_PRICE_ID}
              label="Start Enterprise — $149/mo"
              variant="outlined"
              className="w-full mb-8"
            />
            <ul className="space-y-3">
              {enterpriseFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm font-['Space_Grotesk'] text-[#3a3935]">
                  <span className="text-[#1d7a4f] mt-0.5 shrink-0">+</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 border-t border-[#dddbd6] pt-12">
          <h2 className="font-['Space_Grotesk'] text-xl font-semibold text-[#111110] mb-8">
            Common questions
          </h2>
          <div className="grid grid-cols-2 gap-8">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel from your settings page and your plan stays active until the end of the billing period. No questions asked.',
              },
              {
                q: 'Is there a free trial?',
                a: 'The free plan lets you try the quiz and see your top recommendation. Upgrade to Pro to unlock everything.',
              },
              {
                q: 'What counts as a team member?',
                a: 'Anyone you invite to your Ēko workspace. Each person gets their own login and can add or view subscriptions.',
              },
              {
                q: 'Do you store our payment data?',
                a: 'No. Payments are handled entirely by Stripe. Ēko never sees or stores your card details.',
              },
            ].map((item) => (
              <div key={item.q}>
                <p className="font-['Space_Grotesk'] font-semibold text-[#111110] text-sm mb-2">
                  {item.q}
                </p>
                <p className="text-sm font-['Space_Grotesk'] text-[#7a7870] leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
