import { useState } from 'react'
import { useLogs } from '../../hooks/useLogs'
import StatsBar from './StatsBar'
import LogCard from './LogCard'
import LogForm from '../log/LogForm'
import { isToday, isThisWeek, isThisMonth } from 'date-fns'

const dateFilters = [
  { label: 'Hoy', fn: (l) => isToday(new Date(l.logged_at)) },
  { label: 'Esta semana', fn: (l) => isThisWeek(new Date(l.logged_at), { weekStartsOn: 1 }) },
  { label: 'Este mes', fn: (l) => isThisMonth(new Date(l.logged_at)) },
  { label: 'Todo', fn: () => true },
]

export default function HistoryList() {
  const { logs, loading } = useLogs()
  const [dateFilter, setDateFilter] = useState(3)
  const [typeFilter, setTypeFilter] = useState('')
  const [editingLog, setEditingLog] = useState(null)

  const types = [...new Set(logs.map((l) => l.type))]

  const filteredLogs = logs
    .filter((l) => dateFilters[dateFilter].fn(l))
    .filter((l) => !typeFilter || l.type === typeFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-bounce">💩</div>
      </div>
    )
  }

  if (editingLog) {
    return (
      <div>
        <button
          onClick={() => setEditingLog(null)}
          className="text-sm text-accent font-semibold mb-4 cursor-pointer hover:text-accent-hover transition-colors"
        >
          ← Volver al historial
        </button>
        <LogForm initialData={editingLog} onSuccess={() => setEditingLog(null)} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-text-primary font-[family-name:var(--font-display)]">
          Historial 📋
        </h1>
      </div>

      <StatsBar logs={logs} />

      <div className="flex flex-wrap gap-2 mb-4">
        {dateFilters.map((filter, i) => (
          <button
            key={filter.label}
            onClick={() => setDateFilter(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              dateFilter === i
                ? 'bg-accent text-white'
                : 'bg-cream-card text-text-secondary hover:bg-border/50 border border-border/50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {types.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !typeFilter
                ? 'bg-accent text-white'
                : 'bg-cream-card text-text-secondary hover:bg-border/50 border border-border/50'
            }`}
          >
            Todos
          </button>
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === type
                  ? 'bg-accent text-white'
                  : 'bg-cream-card text-text-secondary hover:bg-border/50 border border-border/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {filteredLogs.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl block mb-4">💩</span>
          <p className="text-text-secondary font-medium">No hay registros todavía</p>
          <p className="text-text-secondary text-sm mt-1">¡Ve a registrar tu primera caca! 🌈</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <LogCard key={log.id} log={log} onEdit={setEditingLog} />
          ))}
        </div>
      )}
    </div>
  )
}
