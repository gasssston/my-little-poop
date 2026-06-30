import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import NotificationList from './NotificationList'
import { useLanguage } from '../../hooks/useLanguage'

export default function NotificationBell({ unreadCount, notifications, onMarkAsRead, onMarkAllAsRead, onDelete }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const scrollY = useRef(0)

  useEffect(() => {
    if (open) {
      scrollY.current = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY.current}px`
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY.current)
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
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
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 animate-[fadeIn_150ms_ease]"
          onClick={() => setOpen(false)}
        />
      )}

      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-border/50 text-text-secondary hover:text-text-primary transition-all cursor-pointer z-50"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error rounded-full animate-ping opacity-75" />
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </>
        )}
      </button>

      <div
        className={`fixed right-4 top-16 w-80 bg-cream-card rounded-2xl border border-border shadow-lg z-50 flex flex-col max-h-[70vh] transition-all duration-200 origin-top-right ${
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
          <div className="sticky top-0 bg-cream-card rounded-t-2xl z-10 flex items-center justify-between p-3 border-b border-border/50">
            <h3 className="text-sm font-bold text-text-primary">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-accent font-semibold hover:text-accent-hover transition-colors cursor-pointer"
              >
                {t('notifications.markAllRead')}
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
