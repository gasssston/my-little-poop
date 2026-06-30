import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import esT from '../lib/i18n/es.json'

const t = (key) => esT[key] || key

function stripAccents(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function calcStreak(logs) {
  if (!logs || logs.length === 0) return 0
  const dates = [...new Set(
    logs.map((l) => new Date(l.logged_at).toDateString())
  )].sort((a, b) => new Date(b) - new Date(a))

  let streak = 1
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i])
    const prev = new Date(dates[i + 1])
    const diffDays = (current - prev) / (1000 * 60 * 60 * 24)
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function useFriends() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFriends = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Amigos aceptados
    const { data: accepted } = await supabase
      .from('friendships')
      .select('*')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    // Solicitudes recibidas pendientes
    const { data: receivedPending } = await supabase
      .from('friendships')
      .select('*')
      .eq('addressee_id', user.id)
      .eq('status', 'pending')

    // Solicitudes enviadas pendientes
    const { data: sentPending } = await supabase
      .from('friendships')
      .select('*')
      .eq('requester_id', user.id)
      .eq('status', 'pending')

    // Obtener perfiles de amigos
    const friendIds = (accepted || []).map((f) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    )

    let friendProfiles = []
    if (friendIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', friendIds)
      friendProfiles = profiles || []
    }

    // Obtener perfiles de pending
    const pendingIds = (receivedPending || []).map((f) => f.requester_id)
    let pendingProfiles = []
    if (pendingIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', pendingIds)
      pendingProfiles = profiles || []
    }

    // Obtener perfiles de sent
    const sentIds = (sentPending || []).map((f) => f.addressee_id)
    let sentProfiles = []
    if (sentIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', sentIds)
      sentProfiles = profiles || []
    }

    // Obtener logs de amigos para calcular rachas en cliente
    let friendLogsMap = {}
    for (const id of friendIds) {
      const { data: logs } = await supabase
        .from('poop_logs')
        .select('logged_at')
        .eq('user_id', id)
        .order('logged_at', { ascending: false })
        .limit(60)
      friendLogsMap[id] = logs || []
    }

    setFriends(
      (accepted || []).map((f) => {
        const peerId = f.requester_id === user.id ? f.addressee_id : f.requester_id
        const profile = friendProfiles.find((p) => p.id === peerId)
        return {
          ...f,
          peer: profile || null,
          streak: calcStreak(friendLogsMap[peerId]),
        }
      })
    )

    setPending(
      (receivedPending || []).map((f) => ({
        ...f,
        peer: pendingProfiles.find((p) => p.id === f.requester_id) || null,
      }))
    )

    setSent(
      (sentPending || []).map((f) => ({
        ...f,
        peer: sentProfiles.find((p) => p.id === f.addressee_id) || null,
      }))
    )

    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchFriends()
  }, [fetchFriends])

  const searchUsers = async (query) => {
    if (!query || query.length < 2) return []

    // Traer todos los perfiles y filtrar en cliente con soporte de tildes
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, avatar_url')
      .neq('id', user.id)
      .limit(50)

    if (error || !data) return []

    const q = stripAccents(query)

    const results = data.filter((p) => {
      const name = stripAccents(p.name || '')
      const email = stripAccents(p.email || '')
      return name.includes(q) || email.includes(q)
    })

    // Excluir amigos y solicitudes pendientes
    const excludeIds = new Set([
      ...friends.map((f) => f.peer?.id).filter(Boolean),
      ...pending.map((f) => f.peer?.id).filter(Boolean),
      ...sent.map((f) => f.peer?.id).filter(Boolean),
    ])

    return results.filter((p) => !excludeIds.has(p.id)).slice(0, 10)
  }

  const sendRequest = async (userId) => {
    const { error } = await supabase
      .from('friendships')
      .insert([{ requester_id: user.id, addressee_id: userId, status: 'pending' }])
    if (error) throw error

    // Crear notificación
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    await supabase.from('notifications').insert([{
      user_id: userId,
      actor_id: user.id,
      type: 'friend_request',
      message: t('notification.friendRequest').replace('{name}', myProfile?.name || 'Alguien'),
      metadata: { friendship_requester: user.id },
    }])

    await fetchFriends()
  }

  const acceptRequest = async (friendshipId) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', friendshipId)
    if (error) throw error

    // Notificar al que pidió la amistad
    const friendship = pending.find((f) => f.id === friendshipId)
    if (friendship) {
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

      await supabase.from('notifications').insert([{
        user_id: friendship.requester_id,
        actor_id: user.id,
        type: 'friend_accepted',
        message: t('notification.friendAccepted').replace('{name}', myProfile?.name || 'Alguien'),
        metadata: { friendship_id: friendshipId },
      }])
    }

    await fetchFriends()
  }

  const rejectRequest = async (friendshipId) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', friendshipId)
    if (error) throw error
    await fetchFriends()
  }

  const removeFriend = async (friendshipId) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
    if (error) throw error
    await fetchFriends()
  }

  const nudgeFriend = async (friendId) => {
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single()

    const { error } = await supabase.from('notifications').insert([{
      user_id: friendId,
      actor_id: user.id,
      type: 'nudge',
      message: t('notification.nudge').replace('{name}', myProfile?.name || 'Alguien'),
      metadata: {},
    }])

    if (error) throw error
  }

  return {
    friends,
    pending,
    sent,
    searchUsers,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    nudgeFriend,
    loading,
    refetch: fetchFriends,
  }
}
