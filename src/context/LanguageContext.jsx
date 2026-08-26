import { createContext, useContext, useCallback, useMemo, useState } from 'react'
import { getTranslation } from '../i18n/translations'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'foliomeca_lang'

function detectInitialLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') return stored
  } catch {
    // localStorage indisponible (mode privé, etc.) : on retombe sur la détection navigateur
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'fr'
  return nav?.toLowerCase().startsWith('en') ? 'en' : 'fr'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectInitialLang)

  const setLang = useCallback((next) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // pas grave si on ne peut pas persister la préférence
    }
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'fr' ? 'en' : 'fr')
  }, [lang, setLang])

  const t = useCallback((key) => getTranslation(lang, key), [lang])

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage doit être utilisé dans un LanguageProvider')
  return ctx
}
