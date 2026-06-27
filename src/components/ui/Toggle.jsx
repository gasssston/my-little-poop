export default function Toggle({ checked, onChange, label, color = 'accent' }) {
  const colorMap = {
    accent: 'bg-accent',
    error: 'bg-error',
    success: 'bg-success',
  }

  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
          checked ? colorMap[color] : 'bg-border'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
      <span className="text-sm text-text-primary font-medium">{label}</span>
    </label>
  )
}
