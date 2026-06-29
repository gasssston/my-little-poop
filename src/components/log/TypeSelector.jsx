import { useState, useEffect } from 'react'

const types = [
  { emoji: '💧', name: 'Líquida / Diarrea' },
  { emoji: '🌊', name: 'Muy blanda' },
  { emoji: '🍌', name: 'Blanda normal' },
  { emoji: '🌭', name: 'Firme y suave' },
  { emoji: '🪵', name: 'Firme y dura' },
  { emoji: '🪨', name: 'Muy dura / Pellets' },
  { emoji: '✏️', name: 'Otro' },
]

const MAX_CHARS = 30

export default function TypeSelector({ value, onChange }) {
  const [selected, setSelected] = useState(() => value || 'Blanda normal')
  const [customValue, setCustomValue] = useState('')

  useEffect(() => {
    onChange(selected)
  }, [])

  useEffect(() => {
    if (value && value !== selected) {
      setSelected(value)
    }
  }, [value])

  const isOtro = selected === 'Otro' || (selected && !types.some((t) => t.name === selected))

  const handleSelect = (name) => {
    setSelected(name)
    onChange(name)
  }

  const handleOtroClick = () => {
    if (customValue) {
      handleSelect(customValue)
    } else {
      handleSelect('Otro')
    }
  }

  const handleCustomChange = (e) => {
    const text = e.target.value.slice(0, MAX_CHARS)
    setCustomValue(text)
    if (text) {
      handleSelect(text)
    } else {
      handleSelect('Otro')
    }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-3">
        Tipo de heces
      </label>
      <div className="grid grid-cols-4 gap-2">
        {types.map((type) => (
          <button
            key={type.name}
            type="button"
            onClick={() => {
              if (type.name === 'Otro') {
                handleOtroClick()
              } else {
                setCustomValue('')
                handleSelect(type.name)
              }
            }}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              selected === type.name || (type.name === 'Otro' && isOtro)
                ? 'border-accent bg-accent/10 scale-[1.02]'
                : 'border-border/50 bg-white/30 hover:border-border hover:bg-white/50'
            }`}
          >
            <span className="text-2xl">{type.emoji}</span>
            <span className="text-[10px] text-text-secondary text-center leading-tight font-medium">
              {type.name}
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
              placeholder="Escribe tu tipo personalizado..."
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
