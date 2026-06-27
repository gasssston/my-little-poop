import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../hooks/useAuth'
import { loginSchema } from '../../lib/validations'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../ui/Button'
import { LogIn, X, Key } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
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
      toast.error(error.message || 'Error al iniciar sesión')
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
      toast.success('Email de recuperación enviado')
      setShowReset(false)
      setResetEmail('')
    } catch (error) {
      toast.error(error.message || 'Error al enviar email')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
          <input
            type="email"
            {...register('email')}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            placeholder="tu@email.com"
          />
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Contraseña</label>
          <input
            type="password"
            {...register('password')}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            placeholder="••••••"
          />
          {errors.password && <p className="text-error text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowReset(true)}
            className="text-xs text-accent font-semibold hover:text-accent-hover transition-colors cursor-pointer"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button type="submit" loading={loading} className="w-full">
          <LogIn className="w-4 h-4" />
          Iniciar sesión
        </Button>

        <p className="text-center text-sm text-text-secondary">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-accent font-semibold hover:text-accent-hover transition-colors">
            Regístrate aquí
          </Link>
        </p>
      </form>

      {/* Modal de restaurar contraseña */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-cream-card rounded-2xl border border-border p-6 w-full max-w-md shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text-primary font-[family-name:var(--font-display)] flex items-center gap-1.5">
                <Key className="w-5 h-5 text-accent" /> Restaurar contraseña
              </h3>
              <button
                onClick={() => setShowReset(false)}
                className="p-1 rounded-lg hover:bg-border/50 text-text-secondary cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Te enviaremos un email con un enlace para crear una nueva contraseña.
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
                Enviar email de recuperación
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
