import { NavLink } from 'react-router-dom'
import { PlusCircle, ClipboardList, Users, User } from 'lucide-react'

const tabs = [
  { to: '/app/log', icon: PlusCircle, label: 'Registrar' },
  { to: '/app/history', icon: ClipboardList, label: 'Historial' },
  { to: '/app/friends', icon: Users, label: 'Amigos' },
  { to: '/app/account', icon: User, label: 'Cuenta' },
]

export default function BottomTabs() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-cream-card border-t border-border z-40 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 min-w-[64px] ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`
            }
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
