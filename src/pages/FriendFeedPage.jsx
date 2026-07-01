import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useFriendLogs } from '../hooks/useFriendLogs'
import { ArrowLeft, Users, FileText } from 'lucide-react'
import LogCard from '../components/history/LogCard'
import PageHeader from '../components/layout/PageHeader'

export default function FriendFeedPage() {
  const { friendId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { logs, profile, loading } = useFriendLogs(friendId)

  return (
    <div>
      <div className="sticky top-0 z-40 bg-cream pb-4 -mx-4 px-4 pt-4">
        <button
          onClick={() => navigate('/app/friends')}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-all mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('friendFeed.back')}
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              profile?.name?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-text-primary font-[family-name:var(--font-display)]">
              {profile?.name || t('friends.unknown')}
            </h1>
            <p className="text-sm text-text-secondary">{t('friendFeed.subtitle')}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <FileText className="w-8 h-8 text-accent animate-bounce mx-auto" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-10 h-10 text-text-secondary/40 mx-auto mb-3" />
          <p className="text-text-secondary text-sm">{t('friendFeed.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <LogCard key={log.id} log={log} readOnly />
          ))}
        </div>
      )}
    </div>
  )
}
