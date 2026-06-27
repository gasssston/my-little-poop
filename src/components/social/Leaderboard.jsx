import { Trophy } from 'lucide-react'
import LeaderboardRow from './LeaderboardRow'
import Podium from './Podium'

export default function Leaderboard({ data, myUserId, period }) {
  const top3 = data.slice(0, 3)
  const rest = data.slice(3)

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-10 h-10 text-text-secondary/40 mx-auto mb-3" />
        <p className="text-text-secondary text-sm">Sin datos de clasificación</p>
        <p className="text-text-secondary text-xs mt-1">Registra cacas para aparecer aquí</p>
      </div>
    )
  }

  return (
    <div>
      {top3.length >= 3 && <Podium players={top3} myUserId={myUserId} />}

      <div className="space-y-2 mt-4">
        {data.map((player, index) => (
          <LeaderboardRow
            key={player.user_id}
            player={player}
            position={index + 1}
            isMe={player.user_id === myUserId}
            period={period}
          />
        ))}
      </div>
    </div>
  )
}
