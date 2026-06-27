import { useState } from 'react'
import { Trash2, Loader2, Flame } from 'lucide-react'
import { toast } from 'sonner'

export default function FriendCard({ friend, onRemove }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRemove = async () => {
    setLoading(true)
    try {
      await onRemove(friend.id)
      toast.success('Amigo eliminado')
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/30 border border-border/50 hover:scale-[1.01] transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
          {friend.peer?.avatar_url ? (
            <img src={friend.peer.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            friend.peer?.name?.charAt(0)?.toUpperCase() || '?'
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{friend.peer?.name || 'Desconocido'}</p>
          <p className="text-xs text-text-secondary flex items-center gap-1"><Flame className="w-3 h-3" /> {friend.streak || 0} días de racha</p>
        </div>
      </div>
      <div>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="p-2 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={handleRemove}
              disabled={loading}
              className="px-2 py-1 rounded-lg bg-error text-white text-xs font-medium cursor-pointer"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sí'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-2 py-1 rounded-lg bg-border text-text-secondary text-xs font-medium cursor-pointer"
            >
              No
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
