import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../hooks/useAuth'
import { loginSchema } from '../../lib/validations'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import Button from '../ui/Button'
import { LogIn } from 'lucide-react'

export default function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

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

  return (
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
  )
}
