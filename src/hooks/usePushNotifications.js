import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const { user } = useAuth()
  const [swRegistration, setSwRegistration] = useState(null)
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  )

  useEffect(() => {
    if (!user) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    navigator.serviceWorker.register('/sw.js')
      .then((reg) => setSwRegistration(reg))
      .catch(console.error)
  }, [user])

  useEffect(() => {
    if (!swRegistration || !VAPID_PUBLIC_KEY) return
    if (permission !== 'granted') return

    const doSubscribe = async () => {
      try {
        const existingSub = await swRegistration.pushManager.getSubscription()
        if (existingSub) return

        const sub = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })

        await supabase
          .from('push_subscriptions')
          .insert({ user_id: user.id, subscription: sub.toJSON() })
      } catch (err) {
        if (err.code !== '23505') console.error('Push subscribe error:', err)
      }
    }

    doSubscribe()
  }, [swRegistration, permission, user])

  const requestPermission = useCallback(async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
  }, [])

  return { permission, requestPermission }
}
