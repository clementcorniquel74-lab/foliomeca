import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Wrench, Car, Bike } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { isLocalMode, localDB } from '../lib/localMode'
import { useVehicles } from '../hooks/useVehicles'
import MaintenanceTimeline from '../components/maintenance/MaintenanceTimeline'
import Header from '../components/layout/Header'
import { CATEGORIES, categoryLabel } from '../utils/formatters'

export default function MaintenancePage() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { vehicles } = useVehicles()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [vehicleFilter, setVehicleFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      if (isLocalMode) {
        const allVehicles = localDB.read('vehicles', [])
        const myVehicles = allVehicles.filter((v) => v.user_id === user.id)
        const myVehicleIds = new Set(myVehicles.map((v) => v.id))
        const recordsLocal = localDB
          .read('maintenance_records', [])
          .filter((r) => myVehicleIds.has(r.vehicle_id))
          .map((r) => ({ ...r, vehicles: myVehicles.find((v) => v.id === r.vehicle_id) }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
        setRecords(recordsLocal)
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('maintenance_records')
        .select('*, vehicles!inner(id, make, model, type, user_id)')
        .eq('vehicles.user_id', user.id)
        .order('date', { ascending: false })
      setRecords(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (vehicleFilter !== 'all' && r.vehicle_id !== vehicleFilter) return false
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false
      return true
    })
  }, [records, vehicleFilter, categoryFilter])

  return (
    <div className="animate-fade-in">
      <Header title={t('nav.maintenance')} />

      <div className="hidden md:block mb-6">
        <h1 className="font-display font-bold text-2xl tracking-wide">{t('maintenance.title')}</h1>
        <p className="text-base-400 text-sm mt-1">{t('maintenance.subtitle')}</p>
      </div>

      {vehicles.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-1 px-1 mt-4 md:mt-0">
          <FilterChip active={vehicleFilter === 'all'} onClick={() => setVehicleFilter('all')} label={t('maintenance.allVehicles')} />
          {vehicles.map((v) => (
            <FilterChip
              key={v.id}
              active={vehicleFilter === v.id}
              onClick={() => setVehicleFilter(v.id)}
              label={`${v.make} ${v.model}`}
              icon={v.type === 'moto' ? Bike : Car}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
        <FilterChip active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')} label={t('maintenance.allCategories')} />
        {CATEGORIES.map((c) => (
          <FilterChip key={c.value} active={categoryFilter === c.value} onClick={() => setCategoryFilter(c.value)} label={categoryLabel(c.value, t)} color={c.color} />
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-mecha" size={28} /></div>
      ) : vehicles.length === 0 ? (
        <div className="card p-10 text-center">
          <Wrench size={28} className="mx-auto text-base-600 mb-3" />
          <p className="text-base-300">{t('maintenance.addFirstVehicle')}</p>
          <Link to="/garage" className="text-tech text-sm mt-2 inline-block">{t('maintenance.goToGarage')}</Link>
        </div>
      ) : (
        <MaintenanceTimeline
          records={filtered.map((r) => ({
            ...r,
            title: vehicleFilter === 'all' && r.vehicles ? `${r.title} — ${r.vehicles.make} ${r.vehicles.model}` : r.title
          }))}
        />
      )}
    </div>
  )
}

function FilterChip({ active, onClick, label, color, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        active ? 'text-base-950' : 'text-base-300 border-base-600 hover:border-base-500'
      }`}
      style={active ? { backgroundColor: color || '#2AC3FF', borderColor: color || '#2AC3FF' } : {}}
    >
      {Icon && <Icon size={12} />}
      {label}
    </button>
  )
}
