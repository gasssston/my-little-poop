import { useState } from 'react'
import { Search, UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function FriendSearch({ searchUsers, sendRequest }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [sending, setSending] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (query.length < 2) return
    setSearching(true)
    try {
      const users = await searchUsers(query)
      setResults(users)
    } catch {
      toast.error('Error al buscar usuarios')
    } finally {
      setSearching(false)
    }
  }

  const handleSendRequest = async (userId) => {
    setSending(userId)
    try {
      await sendRequest(userId)
      toast.success('Solicitud enviada')
      setResults((prev) => prev.filter((u) => u.id !== userId))
    } catch {
      toast.error('Error al enviar solicitud')
    } finally {
      setSending(null)
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={query.length < 2 || searching}
          className="px-4 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/30 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                </div>
              </div>
              <button
                onClick={() => handleSendRequest(user.id)}
                disabled={sending === user.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {sending === user.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <UserPlus className="w-3 h-3" />
                )}
                Agregar
              </button>
            </div>
          ))}
        </div>
      )}

      {query.length >= 2 && !searching && results.length === 0 && (
        <p className="text-center text-text-secondary text-sm py-4">
          No se encontraron usuarios
        </p>
      )}
    </div>
  )
}
