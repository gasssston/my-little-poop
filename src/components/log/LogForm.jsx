import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogs } from '../../hooks/useLogs'
import { useAuth } from '../../hooks/useAuth'
import { poopLogSchema } from '../../lib/validations'
import { supabase } from '../../lib/supabase'
import { bristolToFormType } from '../../lib/anthropic'
import { toast } from 'sonner'
import Button from '../ui/Button'
import Card from '../ui/Card'
import TypeSelector from './TypeSelector'
import ColorPicker from './ColorPicker'
import PainScale from './PainScale'
import SatisfactionStars from './SatisfactionStars'
import EmojiPicker from './EmojiPicker'
import Slider from '../ui/Slider'
import Toggle from '../ui/Toggle'
import PoopCamera from './PoopCamera'

export default function LogForm({ initialData, onSuccess }) {
  const { addLog, updateLog } = useLogs()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [photoData, setPhotoData] = useState(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(poopLogSchema),
    defaultValues: {
      type: initialData?.type || '',
      color: initialData?.color || '#C8853A',
      duration_minutes: initialData?.duration_minutes || 5,
      pain_level: initialData?.pain_level ?? 0,
      had_blood: initialData?.had_blood || false,
      had_straining: initialData?.had_straining || false,
      satisfaction_level: initialData?.satisfaction_level || 3,
      logged_at: initialData?.logged_at
        ? new Date(initialData.logged_at).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      emoji: initialData?.emoji || '',
      notes: initialData?.notes || '',
    },
  })

  const formValues = watch()

  const handleAnalysisComplete = (result) => {
    setAiResult(result)
    if (result && result.bristol_type) {
      const formType = bristolToFormType(result.bristol_type)
      if (formType) {
        setValue('type', formType)
        toast.success(`Tipo detectado: ${result.bristol_label} — auto-rellenado ✨`)
      }
    }
  }

  const uploadPhoto = async (logId) => {
    if (!photoData || !user) return null

    const fileName = `${user.id}/${logId}.jpg`
    const binaryStr = atob(photoData.base64)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: photoData.mimeType })

    const { error } = await supabase.storage
      .from('poop-photos')
      .upload(fileName, blob, { upsert: true })

    if (error) {
      console.error('Error subiendo foto:', error)
      return null
    }

    return fileName
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      let photoUrl = initialData?.photo_url || null

      if (photoData) {
        // Crear el registro primero para tener el ID
        const tempId = initialData?.id || crypto.randomUUID()
        photoUrl = await uploadPhoto(tempId)
      }

      const payload = {
        ...data,
        logged_at: new Date(data.logged_at).toISOString(),
        photo_url: photoUrl,
        ai_bristol_type: aiResult?.bristol_type || null,
        ai_bristol_label: aiResult?.bristol_label || null,
        ai_pathology_risk: aiResult?.pathology_risks?.filter(Boolean).join(', ') || null,
        ai_recommendations: aiResult?.recommendations?.join(' | ') || null,
        ai_analysis_raw: aiResult ? JSON.stringify(aiResult) : null,
        ai_analyzed_at: aiResult ? new Date().toISOString() : null,
      }

      if (initialData?.id) {
        await updateLog(initialData.id, payload)
        toast.success('¡Registro actualizado! ✏️')
      } else {
        await addLog(payload)
        toast.success('¡Caca registrada con éxito! 🎉')
      }
      onSuccess?.()
    } catch (error) {
      toast.error(error.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Card>
        <TypeSelector value={formValues.type} onChange={(v) => setValue('type', v)} />
        {errors.type && <p className="text-error text-xs mt-2">{errors.type.message}</p>}
      </Card>

      <Card>
        <ColorPicker value={formValues.color} onChange={(v) => setValue('color', v)} />
        {errors.color && <p className="text-error text-xs mt-2">{errors.color.message}</p>}
      </Card>

      {/* Sección de cámara / Análisis IA */}
      <Card className="border-accent/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-text-primary">📸 Analizar mi caca con IA</h3>
          <button
            type="button"
            onClick={() => setShowCamera(!showCamera)}
            className="text-xs text-accent font-semibold hover:text-accent-hover transition-colors cursor-pointer"
          >
            {showCamera ? 'Ocultar' : 'Expandir'} ▾
          </button>
        </div>
        {showCamera && (
          <PoopCamera onAnalysisComplete={handleAnalysisComplete} />
        )}
        {!showCamera && aiResult && (
          <p className="text-xs text-success font-medium">✅ Análisis completado — Tipo Bristol {aiResult.bristol_type}</p>
        )}
      </Card>

      <Card>
        <Slider
          value={formValues.duration_minutes}
          onChange={(v) => setValue('duration_minutes', v)}
          min={0}
          max={60}
          label="Duración"
          unit="min"
        />
        <div className="flex gap-2 mt-3">
          {[1, 3, 10, 30].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setValue('duration_minutes', val)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                formValues.duration_minutes === val
                  ? 'bg-accent text-white'
                  : 'bg-white/50 text-text-secondary hover:bg-white'
              }`}
            >
              {val === 1 ? '<2 min' : val === 3 ? '2–5 min' : val === 10 ? '5–15 min' : '+15 min'}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <PainScale value={formValues.pain_level} onChange={(v) => setValue('pain_level', v)} />
      </Card>

      <Card className="space-y-4">
        <Toggle
          checked={formValues.had_blood}
          onChange={(v) => setValue('had_blood', v)}
          label="🩸 ¿Hubo sangre?"
          color="error"
        />
        <Toggle
          checked={formValues.had_straining}
          onChange={(v) => setValue('had_straining', v)}
          label="💪 ¿Hubo mucho esfuerzo?"
        />
      </Card>

      <Card>
        <SatisfactionStars
          value={formValues.satisfaction_level}
          onChange={(v) => setValue('satisfaction_level', v)}
        />
      </Card>

      <Card>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          📅 Fecha y hora
        </label>
        <input
          type="datetime-local"
          {...register('logged_at')}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
        />
      </Card>

      <Card>
        <EmojiPicker value={formValues.emoji} onChange={(v) => setValue('emoji', v)} />
      </Card>

      <Card>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          📝 Notas
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all resize-none"
          placeholder="¿Algo más que quieras contar?"
        />
      </Card>

      <Button type="submit" loading={loading} className="w-full text-lg py-4">
        {initialData?.id ? 'Actualizar registro ✏️' : 'Registrar mi caca 💩'}
      </Button>
    </form>
  )
}
