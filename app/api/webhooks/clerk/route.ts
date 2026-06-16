import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

interface ClerkUserCreatedEvent {
  type: 'user.created'
  data: {
    id: string
    email_addresses: Array<{ email_address: string; id: string }>
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
    image_url: string | null
  }
}

type ClerkWebhookEvent = ClerkUserCreatedEvent | { type: string; data: unknown }

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

function uniqueSlug(base: string): string {
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const body = await req.text()

  let event: ClerkWebhookEvent
  try {
    const wh = new Webhook(secret)
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent
  } catch (err) {
    console.error('Clerk webhook verification failed:', err)
    return new Response('Webhook verification failed', { status: 400 })
  }

  if (event.type !== 'user.created') {
    return new Response('ok', { status: 200 })
  }

  const userData = (event as ClerkUserCreatedEvent).data
  const primaryEmail = userData.email_addresses.find(
    (e) => e.id === userData.primary_email_address_id
  )?.email_address

  if (!primaryEmail) {
    return new Response('No primary email', { status: 400 })
  }

  const fullName = [userData.first_name, userData.last_name]
    .filter(Boolean)
    .join(' ') || null

  const supabase = createServerClient()

  // Upsert profile (idempotent in case of duplicate delivery)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        clerk_user_id: userData.id,
        email: primaryEmail,
        full_name: fullName,
        avatar_url: userData.image_url,
      },
      { onConflict: 'clerk_user_id' }
    )
    .select('id')
    .single()

  if (profileError || !profile) {
    console.error('Failed to upsert profile:', profileError)
    return new Response('Failed to create profile', { status: 500 })
  }

  // Check if user already has a team (also idempotent)
  const { data: existingMembership } = await supabase
    .from('team_members')
    .select('id')
    .eq('profile_id', profile.id)
    .limit(1)
    .single()

  if (existingMembership) {
    return new Response('ok', { status: 200 })
  }

  // Create a personal team for the user
  const baseName = fullName ?? primaryEmail.split('@')[0]
  const baseSlug = slugify(baseName + ' team')
  const teamSlug = uniqueSlug(baseSlug)

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name: `${baseName}'s Team`,
      slug: teamSlug,
      plan: 'free',
    })
    .select('id')
    .single()

  if (teamError || !team) {
    console.error('Failed to create team:', teamError)
    return new Response('Failed to create team', { status: 500 })
  }

  // Add user as admin of their own team
  const { error: memberError } = await supabase.from('team_members').insert({
    team_id: team.id,
    profile_id: profile.id,
    email: primaryEmail,
    role: 'admin',
    status: 'active',
  })

  if (memberError) {
    console.error('Failed to create team membership:', memberError)
    return new Response('Failed to create team membership', { status: 500 })
  }

  return new Response('ok', { status: 200 })
}
