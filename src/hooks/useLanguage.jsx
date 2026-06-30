import { createContext, useContext, useState } from 'react'
import esTranslations from '../lib/i18n/es.json'
import enTranslations from '../lib/i18n/en.json'
import caTranslations from '../lib/i18n/ca.json'

const allTranslations = { es: esTranslations, en: enTranslations, ca: caTranslations }

function getLocaleCode(lang) {
  const map = { es: 'es', en: 'enUS', ca: 'ca' }
  return map[lang] || 'es'
}

export { getLocaleCode }

const languages = {
  es: { name: 'Español', flag: 'es' },
  en: { name: 'English', flag: 'en' },
  ca: { name: 'Català', flag: 'ca' },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('lang') || 'es'
  })

  const setLang = (newLang) => {
    setLangState(newLang)
    localStorage.setItem('lang', newLang)
  }

  const t = (key) => {
    const translations = allTranslations[lang]
    if (!translations) return key + '!'
    const val = translations[key]
    return val || key + '?'
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
