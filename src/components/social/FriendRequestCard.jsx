import { useLanguage } from '../../hooks/useLanguage'
import { UserCheck, UserX, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export default function FriendRequestCard({ request, onAccept, onReject }) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(null)

  const handleAccept = async () => {
    setLoading('accept')
    try {
      await onAccept(request.id)
      toast.success(t('friends.accepted'))
    } catch {
      toast.error(t('friends.acceptError'))
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    setLoading('reject')
    try {
      await onReject(request.id)
    } catch {
      toast.error(t('friends.rejectError'))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/30 border border-border/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
          {request.peer?.avatar_url ? (
            <img src={request.peer.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            request.peer?.name?.charAt(0)?.toUpperCase() || '?'
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{request.peer?.name || t('friends.unknown')}</p>
          <p className="text-xs text-text-secondary">
            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={handleAccept}
          disabled={loading}
          className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="p-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
