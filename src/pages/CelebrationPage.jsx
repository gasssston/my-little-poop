import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'

export default function CelebrationPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [progress, setProgress] = useState(100)
  const [visible, setVisible] = useState(false)
  const navigatedRef = useRef(false)

  const { message, emoji } = location.state || {}

  useEffect(() => {
    if (!message && !navigatedRef.current) {
      navigatedRef.current = true
      navigate('/app/log', { replace: true })
      return
    }
    requestAnimationFrame(() => setVisible(true))
  }, [message, navigate])

  useEffect(() => {
    if (!message) return

    const duration = 5000
    const interval = 50
    const step = (interval / duration) * 100
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += interval
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(timer)
        navigate('/app/history', { replace: true })
      }
    }, interval)

    return () => clearInterval(timer)
  }, [message, navigate])

  if (!message) return null

  return (
    <div
      onClick={() => navigate('/app/history', { replace: true })}
      className={`min-h-[80vh] flex flex-col items-center justify-center text-center px-6 cursor-pointer select-none transition-all duration-500 ${
        visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.85]'
      }`}
    >
      <div className="mb-8 poop-bounce">
        <span className="text-[120px] md:text-[160px] block leading-none">
          {emoji || '💩'}
        </span>
      </div>

      <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary font-[family-name:var(--font-display)] mb-4 max-w-md leading-tight">
        {message}
      </h1>

      <div className="w-full max-w-xs mx-auto mt-8 mb-6">
        <div className="h-2 rounded-full bg-border/50 overflow-hidden">
          <div
            style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
            className="h-full rounded-full bg-accent"
          />
        </div>
      </div>

      <p className="text-sm text-text-secondary animate-pulse">
        {t('celebration.continue')}
      </p>
    </div>
  )
}
