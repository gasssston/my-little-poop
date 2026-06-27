import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export const profileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
})

export const passwordSchema = z.object({
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export const poopLogSchema = z.object({
  type: z.string().min(1, 'Selecciona un tipo'),
  color: z.string().min(1, 'Selecciona un color'),
  duration_minutes: z.number().min(0).max(120).optional(),
  pain_level: z.number().min(0).max(5),
  had_blood: z.boolean(),
  had_straining: z.boolean(),
  satisfaction_level: z.number().min(1).max(5),
  logged_at: z.string().min(1, 'Fecha requerida'),
  emoji: z.string().optional(),
  notes: z.string().optional(),
})
