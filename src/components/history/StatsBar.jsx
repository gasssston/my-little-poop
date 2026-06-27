import { subDays, isAfter } from 'date-fns'
import { Flame, Microscope, TrendingUp, BarChart3, RefreshCw, Star } from 'lucide-react'

export default function StatsBar({ logs }) {
  const total = logs.length

  const uniqueDays = new Set(
    logs.map((l) => new Date(l.logged_at).toDateString())
  )
  const streak = uniqueDays.size

  const typeCount = {}
  logs.forEach((l) => {
    typeCount[l.type] = (typeCount[l.type] || 0) + 1
  })
  const mostFrequent = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]

  const avgSatisfaction = logs.length
    ? (logs.reduce((sum, l) => sum + (l.satisfaction_level || 0), 0) / logs.length).toFixed(1)
    : '0'

  const bristolCount = {}
  logs.forEach((l) => {
    if (l.ai_bristol_type) {
      bristolCount[l.ai_bristol_type] = (bristolCount[l.ai_bristol_type] || 0) + 1
    }
  })
  const mostFrequentBristol = Object.entries(bristolCount).sort((a, b) => b[1] - a[1])[0]

  const weekAgo = subDays(new Date(), 7)
  const recentLogs = logs.filter((l) => isAfter(new Date(l.logged_at), weekAgo))
  const recentBristol = recentLogs
    .filter((l) => l.ai_bristol_type)
    .map((l) => l.ai_bristol_type)

  let trend = '—'
  let TrendIcon = null
  if (recentBristol.length >= 2) {
    const first = recentBristol.slice(0, Math.floor(recentBristol.length / 2))
    const second = recentBristol.slice(Math.floor(recentBristol.length / 2))
    const avgFirst = first.reduce((a, b) => a + b, 0) / first.length
    const avgSecond = second.reduce((a, b) => a + b, 0) / second.length
    const diff = avgSecond - avgFirst
    if (Math.abs(diff) < 0.3) { trend = 'Estable'; TrendIcon = BarChart3 }
    else if (diff > 0 && avgSecond <= 5) { trend = 'Mejorando'; TrendIcon = TrendingUp }
    else if (diff < 0 && avgSecond >= 3) { trend = 'Mejorando'; TrendIcon = TrendingUp }
    else { trend = 'Cambiando'; TrendIcon = RefreshCw }
  } else if (recentBristol.length === 1) {
    trend = recentBristol[0] === 4 ? 'Ideal' : `${recentBristol[0]}/7`
    TrendIcon = recentBristol[0] === 4 ? Star : BarChart3
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-cream-card rounded-xl border border-border/50 p-3 text-center">
        <div className="text-2xl font-bold text-accent">{total}</div>
        <div className="text-xs text-text-secondary">Total registros</div>
      </div>
      <div className="bg-cream-card rounded-xl border border-border/50 p-3 text-center">
        <div className="text-2xl font-bold text-accent flex items-center justify-center gap-1"><Flame className="w-5 h-5" /> {streak}</div>
        <div className="text-xs text-text-secondary">Días activos</div>
      </div>
      <div className="bg-cream-card rounded-xl border border-border/50 p-3 text-center">
        <div className="text-2xl font-bold text-accent truncate flex items-center justify-center gap-1">
          {mostFrequentBristol ? <><Microscope className="w-5 h-5" /> {mostFrequentBristol[0]}</> : '—'}
        </div>
        <div className="text-xs text-text-secondary">Bristol más frecuente</div>
      </div>
      <div className="bg-cream-card rounded-xl border border-border/50 p-3 text-center">
        <div className="text-2xl font-bold text-accent truncate flex items-center justify-center gap-1">
          {TrendIcon && <TrendIcon className="w-5 h-5" />} {trend}
        </div>
        <div className="text-xs text-text-secondary">Tendencia 7 días</div>
      </div>
    </div>
  )
}
