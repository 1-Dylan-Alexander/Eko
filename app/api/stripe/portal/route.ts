import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase/server'

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()

  if (!profile) {
    return Response.json({ error: 'Profile not found' }, { status: 404 })
  }

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id, teams(stripe_customer_id)')
    .eq('profile_id', profile.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  const team = membership?.teams as { stripe_customer_id: string | null } | null
  const customerId = team?.stripe_customer_id

  if (!customerId) {
    return Response.json({ error: 'No billing account found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/settings`,
  })

  return Response.json({ url: session.url })
}
