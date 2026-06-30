import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../hooks/useAuth'
import { registerSchema } from '../../lib/validations'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../ui/Button'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export default function RegisterForm() {
  const { signUp } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await signUp(data.email, data.password, data.name)
      toast.success(t('register.success'))
      navigate('/app/log')
    } catch (error) {
      toast.error(error.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">{t('common.name')}</label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
          placeholder={t('common.name')}
        />
        {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
      </div>

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

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">{t('register.confirmPassword')}</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              {...register('confirmPassword')}
              className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
              placeholder="••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer eye-toggle"
          >
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" loading={loading} className="w-full">
        <UserPlus className="w-4 h-4" />
        {t('register.title')}
      </Button>

      <p className="text-center text-sm text-text-secondary">
        {t('register.hasAccount')}{' '}
        <Link to="/login" className="text-accent font-semibold hover:text-accent-hover transition-colors">
          {t('register.loginLink')}
        </Link>
      </p>
    </form>
  )
}
