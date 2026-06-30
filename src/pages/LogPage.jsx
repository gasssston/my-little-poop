import { useLanguage } from '../hooks/useLanguage'
import { PlusCircle } from 'lucide-react'
import LogForm from '../components/log/LogForm'

export default function LogPage() {
  const { t } = useLanguage()
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-text-primary font-[family-name:var(--font-display)] flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-accent" /> {t('logPage.title')}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{t('logPage.subtitle')}</p>
      </div>
      <LogForm />
    </div>
  )
}
