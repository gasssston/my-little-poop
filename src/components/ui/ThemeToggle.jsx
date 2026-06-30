import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { useLanguage } from '../../hooks/useLanguage'

export default function ThemeToggle() {
  const { t } = useLanguage()
  const { dark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-border/50 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
      title={dark ? t('theme.light') : t('theme.dark')}
    >
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}
