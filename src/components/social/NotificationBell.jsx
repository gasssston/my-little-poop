import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import NotificationList from './NotificationList'

export default function NotificationBell({ unreadCount, notifications, onMarkAsRead, onMarkAllAsRead }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-border/50 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-cream-card rounded-2xl border border-border shadow-lg z-50">
          <div className="flex items-center justify-between p-3 border-b border-border/50">
            <h3 className="text-sm font-bold text-text-primary">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-accent font-semibold hover:text-accent-hover transition-colors cursor-pointer"
              >
                Marcar todo leído
              </button>
            )}
          </div>
          <NotificationList
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
          />
        </div>
      )}
    </div>
  )
}
