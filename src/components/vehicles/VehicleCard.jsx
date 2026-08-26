import { Link } from 'react-router-dom'
import { Car, Bike, Gauge, Wallet, BellRing, ChevronRight, ImageOff } from 'lucide-react'
import { formatCurrency, formatMileage } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function VehicleCard({ vehicle }) {
  const { profile } = useAuth()
  const { t, lang } = useLanguage()
  const currency = profile?.currency || 'EUR'
  const isMoto = vehicle.type === 'moto'
  const pendingCount = vehicle.pending_reminders?.length || 0

  return (
    <Link
      to={`/garage/${vehicle.id}`}
      className="card group overflow-hidden hover:border-mecha/40 hover:shadow-glow transition-all animate-fade-in"
    >
      <div className="relative h-40 bg-base-800 overflow-hidden">
        {vehicle.image_url ? (
          <img
            src={vehicle.image_url}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-600">
            <ImageOff size={32} />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={isMoto ? 'badge-moto' : 'badge-auto'}>
            {isMoto ? <Bike size={12} /> : <Car size={12} />}
            {isMoto ? t('vehicle.moto') : t('vehicle.auto')}
          </span>
        </div>
        {pendingCount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-base-950/80 backdrop-blur px-2.5 py-1 text-xs font-semibold text-amber-400">
              <BellRing size={12} />
              {pendingCount}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-base-950/90 to-transparent" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-base-100 truncate">{vehicle.make} {vehicle.model}</h3>
            <p className="text-xs text-base-400">{vehicle.year} {vehicle.license_plate ? `• ${vehicle.license_plate}` : ''}</p>
          </div>
          <ChevronRight size={18} className="text-base-500 group-hover:text-mecha group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-tech/10 flex items-center justify-center shrink-0">
              <Gauge size={14} className="text-tech" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-base-400 leading-none mb-0.5">{t('vehicle.mileage')}</p>
              <p className="text-sm font-semibold truncate">{formatMileage(vehicle.current_mileage, lang)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-mecha/10 flex items-center justify-center shrink-0">
              <Wallet size={14} className="text-mecha" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-base-400 leading-none mb-0.5">{t('vehicle.spent')}</p>
              <p className="text-sm font-semibold truncate">{formatCurrency(vehicle.total_cost, currency)}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
