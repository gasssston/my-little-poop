import { Bell, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useLanguage } from '../../hooks/useLanguage'

function NotificationItem({ notif, onMarkAsRead, onDelete }) {
  const { t } = useLanguage()
  return (
    <div className="flex items-start gap-2 p-3 hover:bg-white/30 transition-all group">
      <button
        onClick={() => !notif.read && onMarkAsRead(notif.id)}
        className="flex-1 min-w-0 text-left cursor-pointer"
      >
        <div className="flex items-start gap-2">
          <div className="shrink-0 mt-0.5">
            {!notif.read && (
              <span className="w-2 h-2 rounded-full bg-accent block" />
            )}
          </div>
          <div>
            <p className="text-xs text-text-primary leading-relaxed">{notif.message}</p>
            <p className="text-[10px] text-text-secondary mt-0.5">
              {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </button>
      <button
        onClick={() => onDelete(notif.id)}
        className="shrink-0 p-1.5 rounded-lg opacity-40 hover:opacity-100 hover:bg-error/10 text-text-secondary hover:text-error transition-all cursor-pointer"
        title={t('notifications.delete')}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function NotificationList({ notifications, onMarkAsRead, onDelete }) {
  const { t } = useLanguage()
  if (notifications.length === 0) {
    return (
      <div className="text-center py-6">
        <Bell className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" />
        <p className="text-text-secondary text-xs">{t('notifications.empty')}</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/30">
      {notifications.map((notif) => (
        <NotificationItem
          key={notif.id}
          notif={notif}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
