import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export const runtime = 'nodejs'

const PLAN_BY_PRICE: Record<string, 'pro' | 'enterprise'> = {
  'price_1Tf2DfBy8Sd2wzDRC2KmRsCU': 'pro',
  'price_1Tf2EABy8Sd2wzDRnH9KOJup': 'enterprise',
}

// Approximate next renewal: billing_cycle_anchor + 30 days
// Corrected precisely by invoice.paid events
function nextRenewalFromAnchor(anchor: number): string {
  return new Date((anchor + 30 * 24 * 60 * 60) * 1000).toISOString()
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  const supabase = createServerClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const teamId = session.metadata?.team_id
        const subscriptionId = session.subscription as string
        if (!teamId || !subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId ? PLAN_BY_PRICE[priceId] : undefined
        if (!plan) break

        const expiresAt = nextRenewalFromAnchor(subscription.billing_cycle_anchor)

        await supabase
          .from('teams')
          .update({
            plan,
            plan_expires_at: expiresAt,
            stripe_subscription_id: subscriptionId,
          })
          .eq('id', teamId)

        await supabase.from('audit_log').insert({
          team_id: teamId,
          action: 'plan.upgraded',
          resource_type: 'team',
          resource_id: teamId,
          metadata: { plan, stripe_subscription_id: subscriptionId },
        })

        break
      }

      case 'invoice.paid': {
        // Precise renewal date from the invoice period_end
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        if (!customerId) break

        const expiresAt = new Date(invoice.period_end * 1000).toISOString()

        const { data: team } = await supabase
          .from('teams')
          .select('id, plan')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!team || team.plan === 'free') break

        await supabase
          .from('teams')
          .update({ plan_expires_at: expiresAt })
          .eq('id', team.id)

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const teamId = subscription.metadata?.team_id
        if (!teamId) break

        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId ? PLAN_BY_PRICE[priceId] : undefined
        if (!plan) break

        await supabase
          .from('teams')
          .update({ plan })
          .eq('id', teamId)

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const teamId = subscription.metadata?.team_id
        if (!teamId) break

        await supabase
          .from('teams')
          .update({
            plan: 'free',
            plan_expires_at: null,
            stripe_subscription_id: null,
          })
          .eq('id', teamId)

        await supabase.from('audit_log').insert({
          team_id: teamId,
          action: 'plan.cancelled',
          resource_type: 'team',
          resource_id: teamId,
          metadata: { stripe_subscription_id: subscription.id },
        })

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        if (!customerId) break

        const { data: team } = await supabase
          .from('teams')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!team) break

        await supabase.from('audit_log').insert({
          team_id: team.id,
          action: 'invoice.payment_failed',
          resource_type: 'team',
          resource_id: team.id,
          metadata: { invoice_id: invoice.id },
        })

        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return new Response('Webhook handler error', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}
