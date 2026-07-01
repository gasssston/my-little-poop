import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomTabs from './BottomTabs'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { Bell, X } from 'lucide-react'
import { useState } from 'react'

export default function AppLayout() {
  const { permission, requestPermission } = usePushNotifications()
  const [dismissed, setDismissed] = useState(false)

  return (
    <div className="min-h-screen bg-cream">
      {permission === 'default' && !dismissed && (
        <div className="fixed top-0 left-0 right-0 z-50 md:left-60 bg-accent text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Bell className="w-4 h-4 shrink-0" />
            <span>Recibe notificaciones cuando tus amigas hagan caca 💩</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={requestPermission}
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold transition-all cursor-pointer"
            >
              Activar
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <Sidebar />
      <main className="md:ml-60 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 pb-6">
          {permission === 'default' && !dismissed && <div className="pt-14 md:pt-0" />}
          <Outlet />
        </div>
      </main>
      <BottomTabs />
    </div>
  )
}
