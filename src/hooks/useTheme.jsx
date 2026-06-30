import { useState, useEffect, useCallback } from 'react'

export function useTheme() {
  const [dark, setDarkState] = useState(() => {
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  const setDark = useCallback((value) => {
    setDarkState(value)
    localStorage.setItem('theme', value ? 'dark' : 'light')
  }, [])

  const toggle = useCallback(() => setDark(!dark), [dark, setDark])

  return { dark, setDark, toggle }
}
