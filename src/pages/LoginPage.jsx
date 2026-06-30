import { useLanguage } from '../hooks/useLanguage'
import LoginForm from '../components/auth/LoginForm'

export default function LoginPage() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl block mb-3">💩</span>
          <h1 className="text-3xl font-extrabold text-text-primary font-[family-name:var(--font-display)]">
            My Little Poop
          </h1>
          <p className="text-text-secondary mt-1">{t('loginPage.subtitle')}</p>
        </div>
        <div className="bg-cream-card rounded-2xl border border-border/50 p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
