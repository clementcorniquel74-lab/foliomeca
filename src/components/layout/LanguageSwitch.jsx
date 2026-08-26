import { useLanguage } from '../../context/LanguageContext'

// Petit sélecteur FR/EN avec drapeaux, un clic suffit pour basculer.
export default function LanguageSwitch({ className = '' }) {
  const { lang, setLang } = useLanguage()

  return (
    <div className={`inline-flex items-center bg-base-800 rounded-lg p-1 border border-base-700/60 ${className}`}>
      <button
        type="button"
        onClick={() => setLang('fr')}
        aria-label="Français"
        title="Français"
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
          lang === 'fr' ? 'bg-base-700 text-base-100' : 'text-base-400 hover:text-base-200'
        }`}
      >
        <span aria-hidden="true">🇫🇷</span> Fr
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-label="English"
        title="English"
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
          lang === 'en' ? 'bg-base-700 text-base-100' : 'text-base-400 hover:text-base-200'
        }`}
      >
        <span aria-hidden="true">🇬🇧</span> En
      </button>
    </div>
  )
}
