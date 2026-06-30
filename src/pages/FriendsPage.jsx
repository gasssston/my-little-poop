import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useFriends } from '../hooks/useFriends'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { Users, Bell, Trophy } from 'lucide-react'
import FriendSearch from '../components/social/FriendSearch'
import FriendRequestCard from '../components/social/FriendRequestCard'
import FriendList from '../components/social/FriendList'
import Leaderboard from '../components/social/Leaderboard'

const tabs = [
  { id: 'friends', label: 'Mis amigos', icon: Users },
  { id: 'requests', label: 'Solicitudes', icon: Bell },
  { id: 'ranking', label: 'Ranking', icon: Trophy },
]

export default function FriendsPage() {
  const { user } = useAuth()
  const { friends, pending, sent, searchUsers, sendRequest, acceptRequest, rejectRequest, removeFriend, nudgeFriend, loading } = useFriends()
  const { weekly, monthly, myPosition, loading: leaderboardLoading } = useLeaderboard(
    friends.map((f) => f.peer?.id).filter(Boolean)
  )
  const [activeTab, setActiveTab] = useState('friends')
  const [period, setPeriod] = useState('weekly')

  // Pedir permiso de notificaciones
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Se pedirá cuando el usuario interactúe
    }
  }, [])

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const leaderboardData = period === 'weekly' ? weekly : monthly

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-text-primary font-[family-name:var(--font-display)] flex items-center gap-2">
          <Users className="w-6 h-6 text-accent" /> Amigos
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Compite con tus amigas por la mejor racha
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              if (tab.id === 'requests') requestNotificationPermission()
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-accent text-white'
                : 'bg-cream-card text-text-secondary hover:bg-border/50 border border-border/50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.id === 'requests' && pending.length > 0 && (
              <span className="ml-1.5 bg-white/30 px-1.5 py-0.5 rounded-full text-[10px]">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          <FriendSearch searchUsers={searchUsers} sendRequest={sendRequest} />
          {loading ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-accent animate-bounce mx-auto" />
            </div>
          ) : (
            <FriendList friends={friends} onRemove={removeFriend} onNudge={nudgeFriend} />
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">Pendientes</h3>
              <div className="space-y-2">
                {pending.map((req) => (
                  <FriendRequestCard
                    key={req.id}
                    request={req}
                    onAccept={acceptRequest}
                    onReject={rejectRequest}
                  />
                ))}
              </div>
            </div>
          )}

          {sent.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">Enviadas</h3>
              <div className="space-y-2">
                {sent.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/30 border border-border/50 opacity-60">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                      {req.peer?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{req.peer?.name || 'Desconocido'}</p>
                      <p className="text-xs text-text-secondary">Solicitud pendiente</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pending.length === 0 && sent.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-10 h-10 text-text-secondary/40 mx-auto mb-3" />
              <p className="text-text-secondary text-sm">Sin solicitudes pendientes</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ranking' && (
        <div>
          {/* Tabs de período */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                period === 'weekly'
                  ? 'bg-accent text-white'
                  : 'bg-cream-card text-text-secondary hover:bg-border/50 border border-border/50'
              }`}
            >
              Esta semana
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                period === 'monthly'
                  ? 'bg-accent text-white'
                  : 'bg-cream-card text-text-secondary hover:bg-border/50 border border-border/50'
              }`}
            >
              Este mes
            </button>
          </div>

          {leaderboardLoading ? (
            <div className="text-center py-8">
              <Trophy className="w-8 h-8 text-accent animate-bounce mx-auto" />
            </div>
          ) : (
            <Leaderboard
              data={leaderboardData}
              myUserId={user?.id}
              period={period}
            />
          )}
        </div>
      )}
    </div>
  )
}
