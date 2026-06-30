import { useState, useEffect } from 'react'
import { useLanguage } from '../../hooks/useLanguage'

const MAX_CHARS = 30

const typeOptions = [
  { value: 'Líquida / Diarrea', labelKey: 'log.types.liquid', emoji: '💧' },
  { value: 'Muy blanda', labelKey: 'log.types.verySoft', emoji: '🌊' },
  { value: 'Blanda normal', labelKey: 'log.types.normalSoft', emoji: '🍌' },
  { value: 'Firme y suave', labelKey: 'log.types.firmSmooth', emoji: '🌭' },
  { value: 'Firme y dura', labelKey: 'log.types.firmHard', emoji: '🪵' },
  { value: 'Muy dura / Pellets', labelKey: 'log.types.veryHard', emoji: '🪨' },
  { value: 'Otro', labelKey: 'log.types.other', emoji: '✏️' },
]

export default function TypeSelector({ value, onChange }) {
  const { t } = useLanguage()
  const [customValue, setCustomValue] = useState('')

  useEffect(() => {
    if (!value) {
      onChange('Blanda normal')
    }
  }, [])

  const isOtro = value === 'Otro' || (value && !typeOptions.some((opt) => opt.value === value))

  const handleOtroClick = () => {
    if (customValue) {
      onChange(customValue)
    } else {
      onChange('Otro')
    }
  }

  const handleCustomChange = (e) => {
    const text = e.target.value.slice(0, MAX_CHARS)
    setCustomValue(text)
    if (text) {
      onChange(text)
    } else {
      onChange('Otro')
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-3">
        {t('log.typeLabel')}
      </label>
      <div className="grid grid-cols-4 gap-2">
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              if (opt.value === 'Otro') {
                handleOtroClick()
              } else {
                setCustomValue('')
                onChange(opt.value)
              }
            }}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              value === opt.value || (opt.value === 'Otro' && isOtro)
                ? 'border-accent bg-accent/10 scale-[1.02]'
                : 'border-border/50 bg-white/30 hover:border-border hover:bg-white/50'
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="text-[10px] text-text-secondary text-center leading-tight font-medium">
              {t(opt.labelKey)}
            </span>
          </button>
        ))}
      </div>

      {isOtro && (
        <div className="mt-3">
          <div className="relative">
            <input
              type="text"
              value={customValue}
              onChange={handleCustomChange}
              placeholder={t('log.typeCustomPlaceholder')}
              maxLength={MAX_CHARS}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm pr-14"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
              {customValue.length}/{MAX_CHARS}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
