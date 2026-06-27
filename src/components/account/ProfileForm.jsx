import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProfile } from '../../hooks/useProfile'
import { useAuth } from '../../hooks/useAuth'
import { profileSchema } from '../../lib/validations'
import { toast } from 'sonner'
import Button from '../ui/Button'
import Card from '../ui/Card'
import AvatarUpload from './AvatarUpload'

export default function ProfileForm() {
  const { profile, updateProfile } = useProfile()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name || '',
      email: user?.email || '',
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await updateProfile({ name: data.name })
      toast.success('Perfil actualizado ✨')
    } catch (error) {
      toast.error(error.message || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-bold text-text-primary font-[family-name:var(--font-display)] mb-4">
        Datos personales
      </h2>
      <AvatarUpload />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Nombre</label>
          <input
            type="text"
            {...register('name')}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
          />
          {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
          <input
            type="email"
            {...register('email')}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-border bg-border/30 text-text-secondary cursor-not-allowed"
          />
        </div>
        <Button type="submit" loading={loading}>
          Guardar cambios
        </Button>
      </form>
    </Card>
  )
}
