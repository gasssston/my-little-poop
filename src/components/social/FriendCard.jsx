import { useState } from 'react'
import { Trash2, Loader2, Flame, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { useLanguage } from '../../hooks/useLanguage'

export default function FriendCard({ friend, onRemove, onNudge }) {
  const { t } = useLanguage()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nudging, setNudging] = useState(false)

  const handleRemove = async () => {
    setLoading(true)
    try {
      await onRemove(friend.id)
      toast.success(t('friends.removeFriend'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  const handleNudge = async () => {
    setNudging(true)
    try {
      await onNudge(friend.peer?.id)
      toast.success(t('friends.nudgeSent'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setNudging(false)
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
          <p className="text-sm font-semibold text-text-primary">{friend.peer?.name || t('friends.unknown')}</p>
          <p className="text-[11px] text-text-secondary truncate max-w-45">{friend.peer?.email}</p>
          <p className="text-xs text-text-secondary flex items-center gap-1"><Flame className="w-3 h-3" /> {friend.streak || 0} {t('friends.streakDays')}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleNudge}
          disabled={nudging}
          className="p-2 rounded-lg hover:bg-accent/10 text-text-secondary hover:text-accent transition-all cursor-pointer"
          title={t('friends.tooltipNudge')}
        >
          {nudging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
        </button>
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
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : t('common.yes')}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-2 py-1 rounded-lg bg-border text-text-secondary text-xs font-medium cursor-pointer"
            >
              {t('common.no')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
