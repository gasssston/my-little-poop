const emojis = ['💩', '🤢', '😅', '😎', '🏆', '💪', '🌈', '🔥', '😱', '🎉']

export default function EmojiPicker({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-primary mb-3">
        Emoji representativo
      </label>
      <div className="flex flex-wrap gap-2">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={`text-2xl p-2 rounded-xl transition-all duration-200 cursor-pointer ${
              value === emoji
                ? 'bg-accent/10 scale-110 ring-2 ring-accent/30'
                : 'bg-white/30 hover:bg-white/50'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
