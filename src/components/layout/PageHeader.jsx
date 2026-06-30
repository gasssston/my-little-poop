import ThemeToggle from '../ui/ThemeToggle'
import LanguageSelector from '../ui/LanguageSelector'
import NotificationBell from '../social/NotificationBell'
import { useNotifications } from '../../hooks/useNotifications'

export default function PageHeader({ title, icon: Icon, subtitle, children }) {
  const { notifications = [], unreadCount = 0, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  return (
    <div className="sticky top-0 z-40 bg-cream pb-4 -mx-4 px-4 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-text-primary font-[family-name:var(--font-display)] flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-accent shrink-0" />}
            <span className="truncate">{title}</span>
          </h1>
          {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <LanguageSelector />
          <NotificationBell
            unreadCount={unreadCount}
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
          />
        </div>
      </div>
      {children}
    </div>
  )
}
