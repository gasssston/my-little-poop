import { useState } from 'react'
import { isToday, isYesterday, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getHealthStatusColor } from '../../lib/anthropic'
import { toast } from 'sonner'
import PhotoModal from './PhotoModal'

const painFaces = ['😊', '😐', '😕', '😣', '😫', '😭']

const typeEmojis = {
  'Líquida / Diarrea': '💧',
  'Muy blanda': '🌊',
  'Blanda normal': '🍌',
  'Firme y suave': '🌭',
  'Firme y dura': '🪵',
  'Muy dura / Pellets': '🪨',
  'Otro': '✏️',
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  if (isToday(date)) return `Hoy a las ${format(date, 'HH:mm')}`
  if (isYesterday(date)) return `Ayer a las ${format(date, 'HH:mm')}`
  return format(date, "d 'de' MMMM 'a las' HH:mm", { locale: es })
}

function getPhotoUrl(photoUrl) {
  if (!photoUrl) return null
  const { data } = supabase.storage.from('poop-photos').getPublicUrl(photoUrl)
  return data?.publicUrl || null
}

export default function LogCard({ log, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await onDelete(log.id)
      toast.success('Registro eliminado 🗑️')
    } catch {
      toast.error('Error al eliminar')
    }
    setConfirming(false)
  }

  const photoUrl = getPhotoUrl(log.photo_url)
  const statusStyle = log.ai_bristol_label ? getHealthStatusColor(
    log.ai_analysis_raw ? JSON.parse(log.ai_analysis_raw).health_status : 'aceptable'
  ) : null

  return (
    <>
      <div className="bg-cream-card rounded-2xl border border-border/50 p-4 shadow-sm hover:scale-[1.01] transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{log.emoji || typeEmojis[log.type] || '💩'}</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">{formatDate(log.logged_at)}</p>
              <p className="text-xs text-text-secondary">{log.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(log)}
              className="p-2 rounded-lg hover:bg-border/50 text-text-secondary hover:text-accent transition-all cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="p-2 rounded-lg hover:bg-error/10 text-text-secondary hover:text-error transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-1">
                <button
                  onClick={handleDelete}
                  className="px-2 py-1 rounded-lg bg-error text-white text-xs font-medium cursor-pointer"
                >
                  Sí
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="px-2 py-1 rounded-lg bg-border text-text-secondary text-xs font-medium cursor-pointer"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center text-sm">
          <div
            className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
            style={{ backgroundColor: log.color }}
            title="Color"
          />
          {log.duration_minutes != null && (
            <span className="text-text-secondary">⏱️ {log.duration_minutes} min</span>
          )}
          <span className="text-text-secondary">{painFaces[log.pain_level] || '😊'}</span>
          <span className="text-text-secondary">
            💩 {log.satisfaction_level}/5
          </span>
          {log.had_blood && (
            <span className="bg-error/10 text-error text-xs font-semibold px-2 py-0.5 rounded-full">
              Sangre ⚠️
            </span>
          )}
          {log.had_straining && (
            <span className="bg-accent/10 text-accent text-xs font-semibold px-2 py-0.5 rounded-full">
              Esfuerzo 💪
            </span>
          )}
          {log.had_splash && (
            <span className="bg-[#5BA8C8]/10 text-[#5BA8C8] text-xs font-semibold px-2 py-0.5 rounded-full">
              Salpicó 💦
            </span>
          )}
          {log.had_farts && (
            <span className="bg-accent-hover/10 text-accent-hover text-xs font-semibold px-2 py-0.5 rounded-full">
              Pedos 💨
            </span>
          )}
        </div>

        {/* Badges de IA */}
        {(log.ai_bristol_type || log.ai_bristol_label) && (
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="bg-accent/10 text-accent text-xs font-semibold px-2 py-1 rounded-full">
              🔬 Bristol {log.ai_bristol_type}
            </span>
            {statusStyle && (
              <span className={`${statusStyle.bg} ${statusStyle.text} text-xs font-semibold px-2 py-1 rounded-full`}>
                {statusStyle.emoji} {JSON.parse(log.ai_analysis_raw || '{}').health_status}
              </span>
            )}
          </div>
        )}

        {/* Foto y notas */}
        <div className="flex items-start gap-3 mt-3">
          {photoUrl && (
            <button
              onClick={() => setModalOpen(true)}
              className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-accent/30 transition-all cursor-pointer"
            >
              <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
            </button>
          )}
          {log.notes && (
            <p className="text-xs text-text-secondary italic">📝 {log.notes}</p>
          )}
        </div>
      </div>

      <PhotoModal src={photoUrl} alt="Foto de la deposición" onClose={() => setModalOpen(false)} />
    </>
  )
}
