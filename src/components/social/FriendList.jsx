import { Users } from 'lucide-react'
import FriendCard from './FriendCard'

export default function FriendList({ friends, onRemove }) {
  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-10 h-10 text-text-secondary/40 mx-auto mb-3" />
        <p className="text-text-secondary text-sm">Aún no tienes amigas</p>
        <p className="text-text-secondary text-xs mt-1">¡Busca amigas para competir juntas!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {friends.map((friend) => (
        <FriendCard key={friend.id} friend={friend} onRemove={onRemove} />
      ))}
    </div>
  )
}
