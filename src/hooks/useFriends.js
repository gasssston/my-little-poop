import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

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

    // Obtener rachas de amigos
    let friendMap = {}
    for (const id of friendIds) {
      const { data: streak } = await supabase.rpc('get_user_streak', { uid: id })
      friendMap[id] = streak || 0
    }

    setFriends(
      (accepted || []).map((f) => {
        const peerId = f.requester_id === user.id ? f.addressee_id : f.requester_id
        const profile = friendProfiles.find((p) => p.id === peerId)
        return {
          ...f,
          peer: profile || null,
          streak: friendMap[peerId] || 0,
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
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .neq('id', user.id)
      .limit(10)

    // Excluir amigos y solicitudes pendientes
    const excludeIds = new Set([
      ...friends.map((f) => f.peer?.id).filter(Boolean),
      ...pending.map((f) => f.peer?.id).filter(Boolean),
      ...sent.map((f) => f.peer?.id).filter(Boolean),
      user.id,
    ])

    return (data || []).filter((p) => !excludeIds.has(p.id))
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
      message: `${myProfile?.name || 'Alguien'} quiere ser tu amiga 💩`,
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
        message: `${myProfile?.name || 'Alguien'} aceptó tu solicitud de amistad 🎉`,
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

  return {
    friends,
    pending,
    sent,
    searchUsers,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    loading,
    refetch: fetchFriends,
  }
}
