import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:app@mylittlepoop.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, emoji } = req.body
  if (!userId) {
    return res.status(400).json({ error: 'userId required' })
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single()

  const actorName = profile?.name || 'Alguien'
  const message = `${actorName} acaba de hacer una caca ${emoji || '💩'}`

  const { data: friendships } = await supabase
    .from('friendships')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

  if (!friendships || friendships.length === 0) {
    return res.json({ sent: 0 })
  }

  const friendIds = friendships.map((f) =>
    f.requester_id === userId ? f.addressee_id : f.requester_id
  )

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('id, subscription')
    .in('user_id', friendIds)

  if (!subscriptions || subscriptions.length === 0) {
    return res.json({ sent: 0 })
  }

  let sent = 0
  const staleIds = []

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub.subscription, JSON.stringify({
        title: 'My Little Poop',
        body: message,
        data: { url: '/app/friends' },
      }))
      sent++
    } catch (err) {
      if (err.statusCode === 410) {
        staleIds.push(sub.id)
      }
    }
  }

  if (staleIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', staleIds)
  }

  return res.json({ sent })
}
