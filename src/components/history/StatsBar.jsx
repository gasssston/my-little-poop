import { subDays, isAfter } from 'date-fns'

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

  // Bristol type más frecuente
  const bristolCount = {}
  logs.forEach((l) => {
    if (l.ai_bristol_type) {
      bristolCount[l.ai_bristol_type] = (bristolCount[l.ai_bristol_type] || 0) + 1
    }
  })
  const mostFrequentBristol = Object.entries(bristolCount).sort((a, b) => b[1] - a[1])[0]

  // Tendencia últimos 7 días
  const weekAgo = subDays(new Date(), 7)
  const recentLogs = logs.filter((l) => isAfter(new Date(l.logged_at), weekAgo))
  const recentBristol = recentLogs
    .filter((l) => l.ai_bristol_type)
    .map((l) => l.ai_bristol_type)

  let trend = '—'
  if (recentBristol.length >= 2) {
    const first = recentBristol.slice(0, Math.floor(recentBristol.length / 2))
    const second = recentBristol.slice(Math.floor(recentBristol.length / 2))
    const avgFirst = first.reduce((a, b) => a + b, 0) / first.length
    const avgSecond = second.reduce((a, b) => a + b, 0) / second.length
    const diff = avgSecond - avgFirst
    if (Math.abs(diff) < 0.3) trend = 'Estable 📊'
    else if (diff > 0 && avgSecond <= 5) trend = 'Mejorando 📈'
    else if (diff < 0 && avgSecond >= 3) trend = 'Mejorando 📈'
    else trend = 'Cambiando 🔄'
  } else if (recentBristol.length === 1) {
    trend = `${recentBristol[0] === 4 ? 'Ideal ⭐' : `${recentBristol[0]}/7`}`
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div className="bg-cream-card rounded-xl border border-border/50 p-3 text-center">
        <div className="text-2xl font-bold text-accent">{total}</div>
        <div className="text-xs text-text-secondary">Total registros</div>
      </div>
      <div className="bg-cream-card rounded-xl border border-border/50 p-3 text-center">
        <div className="text-2xl font-bold text-accent">🔥 {streak}</div>
        <div className="text-xs text-text-secondary">Días activos</div>
      </div>
      <div className="bg-cream-card rounded-xl border border-border/50 p-3 text-center">
        <div className="text-2xl font-bold text-accent truncate">
          {mostFrequentBristol ? `🔬 ${mostFrequentBristol[0]}` : '—'}
        </div>
        <div className="text-xs text-text-secondary">Bristol más frecuente</div>
      </div>
      <div className="bg-cream-card rounded-xl border border-border/50 p-3 text-center">
        <div className="text-2xl font-bold text-accent truncate">{trend}</div>
        <div className="text-xs text-text-secondary">Tendencia 7 días</div>
      </div>
    </div>
  )
}
