import Stripe from 'stripe'

// Server-side Stripe client — never import in client components
// Lazy singleton so the build doesn't fail if env var is missing at compile time
let _stripe: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    _stripe = new Stripe(key, { apiVersion: '2026-05-27.dahlia' })
  }
  return _stripe
}

// Proxy so all existing `stripe.xxx` calls still work without changes
export const stripe = new Proxy({} as Stripe, {
  get(_, prop: string) {
    return getStripeClient()[prop as keyof Stripe]
  },
})
