import { Trophy, Medal, Flame } from 'lucide-react'

export default function LeaderboardRow({ player, position, isMe, period }) {
  const medals = [
    <Trophy className="w-5 h-5 text-yellow-500" />,
    <Medal className="w-5 h-5 text-gray-400" />,
    <Medal className="w-5 h-5 text-amber-600" />,
  ]
  const medal = medals[position - 1]

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        isMe
          ? 'bg-accent/10 border border-accent/30'
          : 'bg-white/30 border border-border/50'
      }`}
    >
      <div className="w-8 text-center">
        {medal ? (
          <span className="flex justify-center">{medal}</span>
        ) : (
          <span className="text-sm font-bold text-text-secondary">{position}</span>
        )}
      </div>

      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-xs shrink-0">
        {player.avatar_url ? (
          <img src={player.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          player.name?.charAt(0)?.toUpperCase() || '?'
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isMe ? 'text-accent' : 'text-text-primary'}`}>
          {isMe ? 'Tú' : player.name}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-accent">{player.count} 💩</p>
        <p className="text-[10px] text-text-secondary flex items-center justify-end gap-0.5"><Flame className="w-3 h-3" /> {player.streak} días</p>
      </div>
    </div>
  )
}
