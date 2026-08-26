import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Warehouse, Wrench, BellRing, UserRound, LogOut, MessageSquareHeart, LifeBuoy } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitch from './LanguageSwitch'

export default function Sidebar() {
  const { profile, user, signOut } = useAuth()
  const { t } = useLanguage()

  const NAV_ITEMS = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/garage', label: t('nav.garage'), icon: Warehouse },
    { to: '/entretiens', label: t('nav.maintenance'), icon: Wrench },
    { to: '/rappels', label: t('nav.reminders'), icon: BellRing },
    { to: '/profil', label: t('nav.profile'), icon: UserRound }
  ]

  const SECONDARY_ITEMS = [
    { to: '/avis', label: t('nav.feedback'), icon: MessageSquareHeart },
    { to: '/contact', label: t('nav.contact'), icon: LifeBuoy }
  ]

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col shrink-0 border-r border-base-700/60 bg-base-900/60 backdrop-blur-sm h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <img src="/logo.png" alt="FolioMeca" className="w-10 h-10 rounded-full shadow-glow shrink-0" />
        <span className="font-display font-bold text-xl tracking-wide">FolioMeca</span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-mecha/10 text-mecha-light border border-mecha/30'
                  : 'text-base-300 hover:text-base-100 hover:bg-base-800 border border-transparent'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <div className="pt-3 mt-3 border-t border-base-700/60 space-y-1">
          {SECONDARY_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-tech/10 text-tech-light border border-tech/30'
                    : 'text-base-400 hover:text-base-100 hover:bg-base-800 border border-transparent'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="px-3 pb-3">
        <LanguageSwitch className="w-full justify-center" />
      </div>

      <div className="px-3 py-4 border-t border-base-700/60">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-base-700 flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile?.full_name || user?.email || '?')[0]?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{profile?.full_name || t('profile.mechanic')}</p>
            <p className="text-xs text-base-400 truncate">{user?.email}</p>
          </div>
          <button onClick={signOut} className="text-base-400 hover:text-mecha p-1.5 rounded-lg hover:bg-base-800 transition-colors" title={t('common.signOut')}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
