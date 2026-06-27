export default function SatisfactionStars({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-3">
        Satisfacción general
      </label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-3xl transition-all duration-200 cursor-pointer hover:scale-110 ${
              star <= value ? 'grayscale-0' : 'grayscale opacity-40'
            }`}
          >
            💩
          </button>
        ))}
      </div>
    </div>
  )
}
