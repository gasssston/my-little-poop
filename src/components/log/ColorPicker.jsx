import { useState } from 'react'

const presetColors = [
  { hex: '#F5E642', name: 'Amarillo claro' },
  { hex: '#C8853A', name: 'Marrón claro' },
  { hex: '#6B3A1F', name: 'Marrón oscuro' },
  { hex: '#5C9E4A', name: 'Verde' },
  { hex: '#1A1A1A', name: 'Negro' },
  { hex: '#CC3333', name: 'Rojo' },
  { hex: '#E87832', name: 'Naranja' },
]

export default function ColorPicker({ value, onChange }) {
  const [showCustom, setShowCustom] = useState(false)

  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-3">
        Color
      </label>
      <div className="flex flex-wrap gap-3 items-center">
        {presetColors.map((color) => (
          <button
            key={color.hex}
            type="button"
            onClick={() => onChange(color.hex)}
            title={color.name}
            className={`w-10 h-10 rounded-full border-3 transition-all duration-200 cursor-pointer hover:scale-110 ${
              value === color.hex
                ? 'border-accent ring-2 ring-accent/30 scale-110'
                : 'border-white shadow-sm'
            }`}
            style={{ backgroundColor: color.hex }}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className={`w-10 h-10 rounded-full border-2 border-dashed transition-all duration-200 cursor-pointer flex items-center justify-center text-xs ${
            showCustom ? 'border-accent bg-accent/10' : 'border-border text-text-secondary hover:border-accent'
          }`}
          title="Color personalizado"
        >
          ✏️
        </button>
        {showCustom && (
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10"
          />
        )}
      </div>
    </div>
  )
}
