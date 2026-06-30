import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../hooks/useLanguage'
import { Globe } from 'lucide-react'

export default function LanguageSelector() {
  const { lang, setLang, languages, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const scrollY = useRef(0)

  useEffect(() => {
    if (open) {
      scrollY.current = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY.current}px`
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY.current)
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 animate-[fadeIn_150ms_ease]"
          onClick={() => setOpen(false)}
        />
      )}

      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-border/50 text-text-secondary hover:text-text-primary transition-all cursor-pointer relative z-50"
        title={t('language.title')}
      >
        <Globe className="w-5 h-5" />
      </button>

      <div
        className={`fixed right-4 top-16 w-60 bg-cream-card rounded-2xl border border-border shadow-lg z-50 overflow-hidden transition-all duration-200 origin-top-right ${
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="p-2">
          {Object.entries(languages).map(([code, { name, flag }]) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false) }}
              className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 rounded-xl transition-colors cursor-pointer ${
                lang === code
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-text-primary hover:bg-white/30'
              }`}
            >
              {code === 'es' ? (
                <svg className="w-5 h-5 shrink-0 rounded-sm" viewBox="0 0 9 6">
                  <rect width="9" height="6" fill="#C60B1E" />
                  <rect y="1.5" width="9" height="3" fill="#FFC400" />
                </svg>
              ) : code === 'en' ? (
                <svg className="w-5 h-5 shrink-0 rounded-sm" viewBox="0 0 60 30">
                  <rect width="60" height="30" fill="#012169" />
                  <rect x="23" width="14" height="30" fill="#FFF" />
                  <rect y="10" width="60" height="10" fill="#FFF" />
                  <rect x="27" width="6" height="30" fill="#C8102E" />
                  <rect y="13" width="60" height="4" fill="#C8102E" />
                  <polygon points="0,0 12,0 60,24 60,30 48,30 0,6" fill="#FFF" />
                  <polygon points="60,0 60,6 12,30 0,30 0,24 48,0" fill="#FFF" />
                  <polygon points="0,0 8,0 60,26 60,30 52,30 0,4" fill="#C8102E" />
                  <polygon points="60,0 60,4 8,30 0,30 0,26 52,0" fill="#C8102E" />
                </svg>
              ) : (
                <svg className="w-5 h-5 shrink-0 rounded-sm" viewBox="0 0 9 6">
                  <rect width="9" height="6" fill="#FFD700" />
                  <rect y="0" width="9" height="0.6" fill="#DA251D" />
                  <rect y="1.2" width="9" height="0.6" fill="#DA251D" />
                  <rect y="2.4" width="9" height="0.6" fill="#DA251D" />
                  <rect y="3.6" width="9" height="0.6" fill="#DA251D" />
                  <rect y="4.8" width="9" height="0.6" fill="#DA251D" />
                </svg>
              )}
              <span>{name}</span>
              {lang === code && (
                <span className="ml-auto text-accent">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
