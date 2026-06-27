const types = [
  { emoji: '💧', name: 'Líquida / Diarrea' },
  { emoji: '🌊', name: 'Muy blanda' },
  { emoji: '🍌', name: 'Blanda normal' },
  { emoji: '🌭', name: 'Firme y suave' },
  { emoji: '🪵', name: 'Firme y dura' },
  { emoji: '🪨', name: 'Muy dura / Pellets' },
  { emoji: '✏️', name: 'Otro' },
]

export default function TypeSelector({ value, onChange }) {
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
            onClick={() => onChange(type.name)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
              value === type.name
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
    </div>
  )
}
