import { useState, useRef } from 'react'
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react'
import { compressImage, createPreviewURL } from '../../lib/imageUtils'
import { analyzePoopImage } from '../../lib/anthropic'
import { toast } from 'sonner'
import AnalysisResult from './AnalysisResult'

export default function PoopCamera({ onAnalysisComplete }) {
  const [preview, setPreview] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [imageData, setImageData] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande (máx 10MB)')
      return
    }

    setPreview(createPreviewURL(file))
    setAnalysisResult(null)

    try {
      const compressed = await compressImage(file)
      setImageData(compressed)
    } catch {
      toast.error('Error al procesar la imagen')
      setPreview(null)
    }
  }

  const handleAnalyze = async () => {
    if (!imageData) return

    setAnalyzing(true)
    try {
      const result = await analyzePoopImage(imageData.base64, imageData.mimeType)

      if (result.error) {
        toast.error(result.error)
        setAnalysisResult(null)
        return
      }

      setAnalysisResult(result)
      onAnalysisComplete?.(result)
      toast.success('Análisis completado 🔬')
    } catch (err) {
      toast.error(err.message || 'Error al analizar la imagen')
      setAnalysisResult(null)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setAnalysisResult(null)
    setImageData(null)
    onAnalysisComplete?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-secondary">
        Tu foto se guarda de forma privada y solo tú puedes verla 🔒
      </p>

      {!preview ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.setAttribute('capture', 'environment')
              fileInputRef.current?.click()
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-border hover:border-accent bg-white/30 hover:bg-white/50 text-text-secondary hover:text-accent transition-all duration-200 cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm font-medium">Hacer foto</span>
          </button>
          <button
            type="button"
            onClick={() => {
              fileInputRef.current?.removeAttribute('capture')
              fileInputRef.current?.click()
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-border hover:border-accent bg-white/30 hover:bg-white/50 text-text-secondary hover:text-accent transition-all duration-200 cursor-pointer"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm font-medium">Subir imagen</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img
              src={preview}
              alt="Preview de la deposición"
              className="w-full max-h-64 object-contain bg-black/5"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {!analysisResult && (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || !imageData}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analizando tu obra de arte... 💩
                </>
              ) : (
                <>
                  🔬 Analizar ahora
                </>
              )}
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {analysisResult && !analysisResult.error && (
        <AnalysisResult result={analysisResult} />
      )}
    </div>
  )
}
