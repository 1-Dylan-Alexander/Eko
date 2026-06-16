import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase/server'

const checkoutSchema = z.object({
  priceId: z.string().startsWith('price_'),
})

const ALLOWED_PRICE_IDS = [
  'price_1Tf2DfBy8Sd2wzDRC2KmRsCU', // Pro Team
  'price_1Tf2EABy8Sd2wzDRnH9KOJup', // Enterprise
]

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid price ID' }, { status: 422 })
  }

  // Security: only allow known price IDs
  if (!ALLOWED_PRICE_IDS.includes(parsed.data.priceId)) {
    return Response.json({ error: 'Invalid price ID' }, { status: 422 })
  }

  const supabase = createServerClient()

  // Get profile and team
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('clerk_user_id', userId)
    .single()

  if (!profile) {
    return Response.json({ error: 'Profile not found' }, { status: 404 })
  }

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, teams(id, stripe_customer_id)')
    .eq('profile_id', profile.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!membership) {
    return Response.json({ error: 'No active team found' }, { status: 404 })
  }

  const team = membership.teams as { id: string; stripe_customer_id: string | null } | null
  if (!team) {
    return Response.json({ error: 'Team not found' }, { status: 404 })
  }

  // Get or create Stripe customer
  let customerId = team.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: {
        team_id: team.id,
        clerk_user_id: userId,
      },
    })
    customerId = customer.id

    await supabase
      .from('teams')
      .update({ stripe_customer_id: customerId })
      .eq('id', team.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: parsed.data.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=1`,
    cancel_url: `${appUrl}/pricing`,
    metadata: {
      team_id: team.id,
      clerk_user_id: userId,
    },
    subscription_data: {
      metadata: {
        team_id: team.id,
        clerk_user_id: userId,
      },
    },
  })

  return Response.json({ url: session.url })
}
