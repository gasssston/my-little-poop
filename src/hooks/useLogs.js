import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('poop_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
    if (!error) setLogs(data)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const addLog = async (logData) => {
    const { error } = await supabase
      .from('poop_logs')
      .insert([{ ...logData, user_id: user.id }])
    if (error) throw error
    await fetchLogs()
  }

  const updateLog = async (id, logData) => {
    const { error } = await supabase
      .from('poop_logs')
      .update(logData)
      .eq('id', id)
    if (error) throw error
    await fetchLogs()
  }

  const deleteLog = async (id) => {
    const { error } = await supabase
      .from('poop_logs')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchLogs()
  }

  return { logs, loading, addLog, updateLog, deleteLog, refetch: fetchLogs }
}
