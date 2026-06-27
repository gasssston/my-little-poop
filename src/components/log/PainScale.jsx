const painFaces = ['😊', '😐', '😕', '😣', '😫', '😭']

export default function PainScale({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-3">
        Nivel de dolor
      </label>
      <div className="flex gap-2 justify-between">
        {painFaces.map((face, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 cursor-pointer ${
              value === index
                ? 'bg-accent/10 scale-110 ring-2 ring-accent/30'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          >
            <span className="text-2xl">{face}</span>
            <span className="text-[10px] text-text-secondary">{index}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
