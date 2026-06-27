import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useLeaderboard(friendIds = []) {
  const { user } = useAuth()
  const [weekly, setWeekly] = useState([])
  const [monthly, setMonthly] = useState([])
  const [myPosition, setMyPosition] = useState({ weekly: 0, monthly: 0 })
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Incluir al usuario actual + sus amigos
    const allIds = [user.id, ...friendIds]

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', allIds)

    if (!profiles || profiles.length === 0) {
      setLoading(false)
      return
    }

    // Obtener logs de esta semana
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const { data: weekLogs } = await supabase
      .from('poop_logs')
      .select('user_id, satisfaction_level')
      .in('user_id', allIds)
      .gte('logged_at', weekStart.toISOString())

    const { data: monthLogs } = await supabase
      .from('poop_logs')
      .select('user_id, satisfaction_level')
      .in('user_id', allIds)
      .gte('logged_at', monthStart.toISOString())

    // Calcular stats por usuario
    const calcStats = (logs) => {
      const stats = {}
      for (const profile of profiles) {
        stats[profile.id] = { count: 0, totalSatisfaction: 0 }
      }
      for (const log of logs || []) {
        if (stats[log.user_id]) {
          stats[log.user_id].count++
          stats[log.user_id].totalSatisfaction += log.satisfaction_level || 0
        }
      }
      return stats
    }

    const weekStats = calcStats(weekLogs)
    const monthStats = calcStats(monthLogs)

    // Obtener rachas
    const streakMap = {}
    for (const profile of profiles) {
      const { data: streak } = await supabase.rpc('get_user_streak', { uid: profile.id })
      streakMap[profile.id] = streak || 0
    }

    // Construir leaderboard semanal
    const weeklyBoard = profiles.map((p) => ({
      user_id: p.id,
      name: p.name,
      avatar_url: p.avatar_url,
      count: weekStats[p.id]?.count || 0,
      avg_satisfaction: weekStats[p.id]?.count
        ? (weekStats[p.id].totalSatisfaction / weekStats[p.id].count).toFixed(1)
        : '0',
      streak: streakMap[p.id] || 0,
    }))
    weeklyBoard.sort((a, b) => b.count - a.count)

    // Construir leaderboard mensual
    const monthlyBoard = profiles.map((p) => ({
      user_id: p.id,
      name: p.name,
      avatar_url: p.avatar_url,
      count: monthStats[p.id]?.count || 0,
      avg_satisfaction: monthStats[p.id]?.count
        ? (monthStats[p.id].totalSatisfaction / monthStats[p.id].count).toFixed(1)
        : '0',
      streak: streakMap[p.id] || 0,
    }))
    monthlyBoard.sort((a, b) => b.count - a.count)

    setWeekly(weeklyBoard)
    setMonthly(monthlyBoard)
    setMyPosition({
      weekly: weeklyBoard.findIndex((e) => e.user_id === user.id) + 1,
      monthly: monthlyBoard.findIndex((e) => e.user_id === user.id) + 1,
    })
    setLoading(false)
  }, [user, friendIds.join(',')])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return { weekly, monthly, myPosition, loading, refetch: fetchLeaderboard }
}
