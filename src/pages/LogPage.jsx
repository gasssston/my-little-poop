import { useLanguage } from '../hooks/useLanguage'
import { PlusCircle } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import LogForm from '../components/log/LogForm'

export default function LogPage() {
  const { t } = useLanguage()
  return (
    <div>
      <PageHeader title={t('logPage.title')} subtitle={t('logPage.subtitle')} icon={PlusCircle} />
      <LogForm />
    </div>
  )
}
