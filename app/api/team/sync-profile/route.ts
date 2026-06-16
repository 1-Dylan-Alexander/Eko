import { auth, currentUser } from '@clerk/nextjs/server'
import { createServerClient } from '@/lib/supabase/server'

// Called on app load to ensure Clerk user is synced to Supabase profiles table
export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await currentUser()
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }

  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? user.emailAddresses[0]?.emailAddress

  if (!email) {
    return Response.json({ error: 'No email on user' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Upsert profile — safe to call multiple times
  const { error } = await supabase.from('profiles').upsert(
    {
      clerk_user_id: userId,
      email,
      full_name:
        [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
      avatar_url: user.imageUrl || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'clerk_user_id' }
  )

  if (error) {
    console.error('Profile sync error:', error)
    return Response.json({ error: 'Profile sync failed' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
