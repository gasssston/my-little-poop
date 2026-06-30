import { Outlet } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import Sidebar from './Sidebar'
import BottomTabs from './BottomTabs'

export default function AppLayout() {
  const notificationData = useNotifications()

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar notificationData={notificationData} />
      <main className="md:ml-60 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
      <BottomTabs notificationData={notificationData} />
    </div>
  )
}
