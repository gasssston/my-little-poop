import { useRef, useState } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'

export default function AvatarUpload() {
  const { profile, uploadAvatar } = useProfile()
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB')
      return
    }
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      await uploadAvatar(file)
      toast.success('Avatar actualizado ✨')
    } catch {
      toast.error('Error al subir la imagen')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const avatarUrl = preview || profile?.avatar_url
  const initial = profile?.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white overflow-hidden cursor-pointer"
        style={{ backgroundColor: avatarUrl ? 'transparent' : '#C8853A' }}
        onClick={() => fileRef.current?.click()}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-sm text-accent font-semibold hover:text-accent-hover transition-colors cursor-pointer disabled:opacity-50"
        >
          <Camera className="w-4 h-4 inline mr-1" />
          {uploading ? 'Subiendo...' : 'Cambiar foto'}
        </button>
        <p className="text-xs text-text-secondary mt-0.5">JPG, PNG. Máx 2MB</p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
