import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    // Obtener perfiles de actores
    const actorIds = [...new Set((data || []).map((n) => n.actor_id))]
    let actorMap = {}
    if (actorIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', actorIds)
      actorMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]))
    }

    setNotifications(
      (data || []).map((n) => ({
        ...n,
        actor: actorMap[n.actor_id] || null,
      }))
    )
    setUnreadCount((data || []).filter((n) => !n.read).length)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Suscripción Realtime
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new
          setNotifications((prev) => [newNotif, ...prev])
          setUnreadCount((prev) => prev + 1)

          // Push notification del navegador
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('My Little Poop 💩', {
              body: newNotif.message,
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const markAsRead = async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    if (error) throw error

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const deleteNotification = async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
    if (error) throw error

    setNotifications((prev) => {
      const deleted = prev.find((n) => n.id === notificationId)
      return prev.filter((n) => n.id !== notificationId)
    })
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)
    if (error) throw error

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading }
}
