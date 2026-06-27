import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export default function NotificationList({ notifications, onMarkAsRead }) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-6">
        <span className="text-3xl block mb-2">🔔</span>
        <p className="text-text-secondary text-xs">Sin notificaciones nuevas</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/30">
      {notifications.map((notif) => (
        <button
          key={notif.id}
          onClick={() => !notif.read && onMarkAsRead(notif.id)}
          className={`w-full text-left p-3 hover:bg-white/30 transition-all cursor-pointer ${
            !notif.read ? 'bg-accent/5' : ''
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="shrink-0 mt-0.5">
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-accent block" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-primary leading-relaxed">{notif.message}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">
                {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
