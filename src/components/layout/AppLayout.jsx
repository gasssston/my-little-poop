import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomTabs from './BottomTabs'
import { usePushNotifications } from '../../hooks/usePushNotifications'

export default function AppLayout() {
  usePushNotifications()

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar />
      <main className="md:ml-60 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 pb-6">
          <Outlet />
        </div>
      </main>
      <BottomTabs />
    </div>
  )
}
