import { z } from 'zod'
import esT from './i18n/es.json'

const t = (key) => esT[key] || key

export const loginSchema = z.object({
  email: z.string().email(t('validation.invalidEmail')),
  password: z.string().min(6, t('validation.passwordMinLength')),
})

export const registerSchema = z.object({
  name: z.string().min(2, t('validation.nameMinLength')),
  email: z.string().email(t('validation.invalidEmail')),
  password: z.string().min(6, t('validation.passwordMinLength')),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: t('validation.passwordsDontMatch'),
  path: ['confirmPassword'],
})

export const profileSchema = z.object({
  name: z.string().min(2, t('validation.nameMinLength')),
  email: z.string().email(t('validation.invalidEmail')),
})

export const passwordSchema = z.object({
  newPassword: z.string().min(6, t('validation.passwordMinLength')),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: t('validation.passwordsDontMatch'),
  path: ['confirmPassword'],
})

export const poopLogSchema = z.object({
  type: z.string().min(1, t('validation.selectType')),
  color: z.string().min(1, t('validation.selectColor')),
  duration_minutes: z.number().min(0).max(120).optional(),
  pain_level: z.number().min(0).max(5),
  had_blood: z.boolean(),
  had_straining: z.boolean(),
  had_splash: z.boolean().optional(),
  had_farts: z.boolean().optional(),
  satisfaction_level: z.number().min(1).max(5),
  logged_at: z.string().min(1, t('validation.dateRequired')),
  emoji: z.string().optional(),
  notes: z.string().optional(),
})
