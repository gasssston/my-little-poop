import { Outlet } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import Sidebar from './Sidebar'
import BottomTabs from './BottomTabs'
import NotificationBell from '../social/NotificationBell'

export default function AppLayout() {
  const { notifications = [], unreadCount = 0, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  return (
    <div className="min-h-screen bg-cream">
      <div className="fixed top-4 right-4 z-50">
        <NotificationBell
          unreadCount={unreadCount}
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
        />
      </div>
      <Sidebar />
      <main className="md:ml-60 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <BottomTabs />
    </div>
  )
}
