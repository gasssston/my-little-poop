import { useLanguage } from '../../hooks/useLanguage'

export default function Podium({ players, myUserId }) {
  const { t } = useLanguage()
  // Orden: 2do, 1ro, 3ro
  const order = [1, 0, 2]
  const heights = ['h-24', 'h-28', 'h-20']
  const medals = ['🥈', '🥇', '🥉']
  const sizes = ['w-12 h-12', 'w-14 h-14', 'w-12 h-12']
  const bgColors = ['#C0C0C0', '#FFD700', '#CD7F32']

  return (
    <div className="flex items-end justify-center gap-3 py-4">
      {order.map((idx, pos) => {
        const player = players[idx]
        if (!player) return null
        const isMe = player.user_id === myUserId
        return (
          <div key={player.user_id} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-1 ${sizes[pos]}`}
              style={{ backgroundColor: bgColors[pos] }}
            >
              {player.avatar_url ? (
                <img src={player.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                player.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>
            <p className={`text-xs font-semibold text-center truncate max-w-[64px] ${isMe ? 'text-accent' : 'text-text-primary'}`}>
              {isMe ? t('leaderboard.you') : player.name?.split(' ')[0]}
            </p>
            <div
              className={`${heights[pos]} w-16 rounded-t-xl flex items-center justify-center text-2xl mt-1`}
              style={{ backgroundColor: `${bgColors[pos]}30` }}
            >
              {medals[pos]}
            </div>
          </div>
        )
      })}
    </div>
  )
}
