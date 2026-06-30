import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../hooks/useAuth'
import { loginSchema } from '../../lib/validations'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../ui/Button'
import { LogIn, X, Key, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../hooks/useLanguage'

export default function LoginForm() {
  const { signIn } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await signIn(data.email, data.password)
      navigate('/app/log')
    } catch (error) {
      toast.error(error.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetEmail) return
    setResetLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error
      toast.success(t('login.recoverySent'))
      setShowReset(false)
      setResetEmail('')
    } catch (error) {
      toast.error(error.message || t('common.error'))
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">{t('common.email')}</label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            placeholder="tu@email.com"
          />
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">{t('common.password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              placeholder="••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer eye-toggle"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowReset(true)}
            className="text-xs text-accent font-semibold hover:text-accent-hover transition-colors cursor-pointer"
          >
            {t('login.forgotPassword')}
          </button>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          <LogIn className="w-4 h-4" />
          {t('login.title')}
        </Button>

        <p className="text-center text-sm text-text-secondary">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-accent font-semibold hover:text-accent-hover transition-colors">
            {t('login.registerLink')}
          </Link>
        </p>
      </form>

      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-cream-card rounded-2xl border border-border p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary font-[family-name:var(--font-display)] flex items-center gap-1.5">
                <Key className="w-5 h-5 text-accent" /> {t('login.resetPassword')}
              </h3>
              <button
                onClick={() => setShowReset(false)}
                className="p-1 rounded-lg hover:bg-border/50 text-text-secondary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              {t('login.resetHint')}
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                placeholder="tu@email.com"
                required
              />
              <Button type="submit" loading={resetLoading} className="w-full">
                {t('login.sendRecovery')}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
