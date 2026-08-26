import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Warehouse, Wrench, BellRing, UserRound } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function BottomNav() {
  const { t } = useLanguage()

  const NAV_ITEMS = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/garage', label: t('nav.garageShort'), icon: Warehouse },
    { to: '/entretiens', label: t('nav.maintenance'), icon: Wrench },
    { to: '/rappels', label: t('nav.reminders'), icon: BellRing },
    { to: '/profil', label: t('nav.profile'), icon: UserRound }
  ]

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-base-900/95 backdrop-blur-lg border-t border-base-700/60 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-mecha' : 'text-base-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
