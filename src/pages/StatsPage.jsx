import { useMemo, Fragment } from 'react'
import { useLogs } from '../hooks/useLogs'
import { useLanguage } from '../hooks/useLanguage'
import { useTheme } from '../hooks/useTheme'
import { BarChart3, Flame, Smile, Download, Calendar } from 'lucide-react'
import Card from '../components/ui/Card'
import PageHeader from '../components/layout/PageHeader'

const POOP_TYPES = [
  'Muy dura / Pellets',
  'Firme y dura',
  'Forma de salchicha con grietas',
  'Salchicha lisa y suave',
  'Trozos blandos con bordes definidos',
  'Blanda y esponjosa',
  'Líquida / Diarrea',
]

export default function StatsPage() {
  const { logs, loading } = useLogs()
  const { t, lang } = useLanguage()
  const { dark } = useTheme()

  const stats = useMemo(() => {
    if (!logs || logs.length === 0) return null

    const total = logs.length
    const totalSatisfaction = logs.reduce((s, l) => s + (l.satisfaction_level || 0), 0)
    const avgSatisfaction = totalSatisfaction / total

    const typeCounts = {}
    logs.forEach((l) => {
      const key = POOP_TYPES[l.type] || l.type || 'Desconocido'
      typeCounts[key] = (typeCounts[key] || 0) + 1
    })
    const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
    const mostCommon = sortedTypes[0]

    // Weekly heatmap (last 12 weeks)
    const now = new Date()
    const heatmap = []
    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(now)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - w * 7)
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      const days = []
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart)
        day.setDate(day.getDate() + d)
        const dayStr = day.toDateString()
        const count = logs.filter((l) => new Date(l.logged_at).toDateString() === dayStr).length
        days.push({ date: day, count })
      }
      heatmap.push({ weekStart, days })
    }

    // Satisfaction trend (last 30 logs)
    const satisfactionTrend = [...logs]
      .sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at))
      .slice(-30)
      .map((l) => ({ date: l.logged_at, value: l.satisfaction_level || 0 }))

    const uniqueDays = new Set(logs.map((l) => new Date(l.logged_at).toDateString())).size

    return { total, avgSatisfaction, mostCommon, sortedTypes, heatmap, satisfactionTrend, uniqueDays }
  }, [logs])

  const exportCsv = () => {
    if (!logs || logs.length === 0) return
    const headers = t('csv.headers').split(',')
    const rows = logs.map((l) => [
      new Date(l.logged_at).toLocaleString(),
      POOP_TYPES[l.type] || l.type || '',
      l.duration_minutes ?? '',
      l.pain_level ?? '',
      l.had_blood ? t('stats.yes') : t('stats.no'),
      l.had_straining ? t('stats.yes') : t('stats.no'),
      l.had_splash ? t('stats.yes') : t('stats.no'),
      l.had_farts ? t('stats.yes') : t('stats.no'),
      l.satisfaction_level ?? '',
      (l.notes || '').replace(/,/g, ';'),
      l.emoji || '',
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-little-poop-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const heatmapColor = (count) => {
    if (count === 0) return dark ? 'bg-dark-border/30' : 'bg-border/30'
    if (count === 1) return 'bg-accent/30'
    if (count === 2) return 'bg-accent/60'
    return 'bg-accent'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <BarChart3 className="w-10 h-10 text-accent animate-bounce" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-12 h-12 text-text-secondary/40 mx-auto mb-4" />
        <p className="text-text-secondary">{t('stats.noData')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('stats.title')} icon={BarChart3} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-accent" />
            <p className="text-xs text-text-secondary">{t('stats.totalPoops')}</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-accent" />
            <p className="text-xs text-text-secondary">{t('history.activeDays')}</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.uniqueDays}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Smile className="w-4 h-4 text-accent" />
            <p className="text-xs text-text-secondary">{t('stats.avgSatisfaction')}</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.avgSatisfaction.toFixed(1)}</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-accent" />
            <p className="text-xs text-text-secondary">{t('stats.mostCommonType')}</p>
          </div>
          <p className="text-sm font-bold text-text-primary leading-tight">{stats.mostCommon?.[0]?.slice(0, 20) || '-'}</p>
        </Card>
      </div>

      <button
        onClick={exportCsv}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all cursor-pointer"
      >
        <Download className="w-4 h-4" /> {t('stats.exportCsv')}
      </button>

      {/* Weekly heatmap */}
      <Card>
        <h3 className="text-sm font-bold text-text-primary mb-3">{t('stats.weeklyHeatmap')}</h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-1 text-[10px] min-w-[400px]">
            <div />
            {[t('heatmap.sun'), t('heatmap.mon'), t('heatmap.tue'), t('heatmap.wed'), t('heatmap.thu'), t('heatmap.fri'), t('heatmap.sat')].map((d, i) => (
              <div key={`hdr-${i}`} className="text-center text-text-secondary font-medium">{d}</div>
            ))}
            {stats.heatmap.map((week, wi) => (
              <Fragment key={`wk-${wi}`}>
                <div className="text-text-secondary text-[9px] pr-1 flex items-center">
                  {week.weekStart.toLocaleDateString(lang, { day: 'numeric', month: 'short' })}
                </div>
                {week.days.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`aspect-square rounded ${heatmapColor(day.count)} transition-colors`}
                    title={`${day.date.toLocaleDateString(lang)}: ${day.count}`}
                  />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </Card>

      {/* Type distribution */}
      <Card>
        <h3 className="text-sm font-bold text-text-primary mb-3">{t('stats.typeDistribution')}</h3>
        <div className="space-y-2">
          {stats.sortedTypes.map(([type, count]) => (
            <div key={type}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-primary truncate">{type}</span>
                <span className="text-text-secondary">{count}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-border/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${(count / stats.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Satisfaction trend */}
      <Card>
        <h3 className="text-sm font-bold text-text-primary mb-3">{t('stats.satisfactionTrend')}</h3>
        {stats.satisfactionTrend.length > 1 ? (
          <svg viewBox="0 0 300 80" className="w-full h-24">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
              points={stats.satisfactionTrend
                .map((p, i) => {
                  const x = (i / Math.max(stats.satisfactionTrend.length - 1, 1)) * 280 + 10
                  const y = 70 - (p.value / 5) * 60
                  return `${x},${y}`
                })
                .join(' ')}
            />
            {stats.satisfactionTrend.filter((_, i) => i % 3 === 0).map((p, i) => {
              const idx = stats.satisfactionTrend.indexOf(p)
              const x = (idx / Math.max(stats.satisfactionTrend.length - 1, 1)) * 280 + 10
              const y = 70 - (p.value / 5) * 60
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="2.5" className="fill-accent" />
                  <text x={x} y="78" className="fill-text-secondary" fontSize="6" textAnchor="middle">
                    {new Date(p.date).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}
                  </text>
                </g>
              )
            })}
          </svg>
        ) : (
          <p className="text-xs text-text-secondary">{t('stats.trendNeedsMore')}</p>
        )}
      </Card>
    </div>
  )
}
