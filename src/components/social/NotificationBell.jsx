import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import NotificationList from './NotificationList'

export default function NotificationBell({ unreadCount, notifications, onMarkAsRead, onMarkAllAsRead, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

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
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      />

      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-border/50 text-text-secondary hover:text-text-primary transition-all cursor-pointer z-50"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <div
        className={`fixed right-4 top-16 w-80 bg-cream-card rounded-2xl border border-border shadow-lg z-50 flex flex-col max-h-[calc(100vh-6rem)] transition-all duration-200 origin-top-right ${
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
          <div className="sticky top-0 bg-cream-card rounded-t-2xl z-10 flex items-center justify-between p-3 border-b border-border/50">
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
          <div className="overflow-y-auto">
            <NotificationList
              notifications={notifications}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          </div>
        </div>
    </div>
  )
}
