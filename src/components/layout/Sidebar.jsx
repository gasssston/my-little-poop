import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { LogOut, PlusCircle, ClipboardList, Users, User } from 'lucide-react'
import { toast } from 'sonner'

export default function Sidebar() {
  const { signOut } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const navItems = [
    { to: '/app/log', icon: PlusCircle, label: t('nav.register') },
    { to: '/app/history', icon: ClipboardList, label: t('nav.history') },
    { to: '/app/friends', icon: Users, label: t('nav.friends') },
    { to: '/app/account', icon: User, label: t('nav.account') },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch {
      toast.error(t('error.logout'))
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen bg-cream-card border-r border-border fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-xl font-extrabold text-text-primary font-[family-name:var(--font-display)] flex items-center gap-2">
          <span className="text-2xl">💩</span> My Little Poop
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-accent/10 text-accent border-l-[3px] border-accent'
                  : 'text-text-secondary hover:bg-border/30 hover:text-text-primary'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}
