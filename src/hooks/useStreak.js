import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useStreak() {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchStreak = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.rpc('get_user_streak', { uid: user.id })
    setStreak(data || 0)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchStreak()
  }, [fetchStreak])

  return { streak, loading, refetch: fetchStreak }
}
