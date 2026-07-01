import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFriendLogs(friendId) {
  const [logs, setLogs] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchFriendLogs = useCallback(async () => {
    if (!friendId) return
    setLoading(true)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', friendId)
      .single()

    setProfile(profileData || null)

    const { data } = await supabase
      .from('poop_logs')
      .select('*')
      .eq('user_id', friendId)
      .order('logged_at', { ascending: false })

    setLogs(data || [])
    setLoading(false)
  }, [friendId])

  useEffect(() => {
    fetchFriendLogs()
  }, [fetchFriendLogs])

  return { logs, profile, loading, refetch: fetchFriendLogs }
}
