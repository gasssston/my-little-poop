import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../../hooks/useAuth'
import { passwordSchema } from '../../lib/validations'
import { toast } from 'sonner'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function PasswordForm() {
  const { updatePassword } = useAuth()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await updatePassword(data.newPassword)
      toast.success('Contraseña actualizada 🔒')
      reset()
    } catch (error) {
      toast.error(error.message || 'Error al actualizar contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-bold text-text-primary font-[family-name:var(--font-display)] mb-4">
        Cambiar contraseña
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Nueva contraseña</label>
          <input
            type="password"
            {...register('newPassword')}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            placeholder="••••••"
          />
          {errors.newPassword && <p className="text-error text-xs mt-1">{errors.newPassword.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Confirmar contraseña</label>
          <input
            type="password"
            {...register('confirmPassword')}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            placeholder="••••••"
          />
          {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <Button type="submit" loading={loading}>
          Actualizar contraseña
        </Button>
      </form>
    </Card>
  )
}
