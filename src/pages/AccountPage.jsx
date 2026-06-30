import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOut, User } from 'lucide-react'
import ProfileForm from '../components/account/ProfileForm'
import PasswordForm from '../components/account/PasswordForm'
import Card from '../components/ui/Card'

export default function AccountPage() {
  const { signOut } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch {
      toast.error(t('common.error'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-text-primary font-[family-name:var(--font-display)] flex items-center gap-2">
          <User className="w-6 h-6 text-accent" /> {t('account.title')}
        </h1>
      </div>

      <ProfileForm />
      <PasswordForm />

      <Card className="border-error/20">
        <h2 className="text-lg font-bold text-error font-[family-name:var(--font-display)] mb-3">
          {t('account.dangerZone')}
        </h2>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/10 text-error font-semibold hover:bg-error/20 transition-all cursor-pointer w-full justify-center"
        >
          <LogOut className="w-4 h-4" />
          {t('account.signOut')}
        </button>
      </Card>
    </div>
  )
}
