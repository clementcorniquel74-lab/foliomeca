import LanguageSwitch from './LanguageSwitch'

export default function Header({ title }) {
  return (
    <header className="md:hidden sticky top-0 z-30 bg-base-950/90 backdrop-blur-lg border-b border-base-700/60 px-4 py-3.5 flex items-center gap-2.5">
      <img src="/logo.png" alt="FolioMeca" className="w-8 h-8 rounded-full shrink-0" />
      <h1 className="font-display font-bold text-lg tracking-wide truncate flex-1">{title}</h1>
      <LanguageSwitch />
    </header>
  )
}
