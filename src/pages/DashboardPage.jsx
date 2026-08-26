import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, TrendingUp, Wrench, BellRing, ArrowRight, PiggyBank } from 'lucide-react'
import { useVehicles } from '../hooks/useVehicles'
import { useReminders } from '../hooks/useReminders'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { isLocalMode, localDB } from '../lib/localMode'
import { CategoryBreakdownChart, MonthlySpendChart, MileageEvolutionChart, SpendPerVehicleChart } from '../components/dashboard/StatsCharts'
import ReminderWidget from '../components/reminders/ReminderWidget'
import Header from '../components/layout/Header'
import { categoryLabel, formatCurrency, reminderStatus } from '../utils/formatters'

// Construit une série fusionnée par date pour le graphique multi-véhicules :
// une ligne par date unique rencontrée, une colonne par vehicle_id (undefined
// si ce véhicule n'a pas de relevé à cette date précise — connectNulls comble le trait).
function buildMileageSeries(vehicles, allRecords) {
  const byVehicle = {}
  vehicles.forEach((v) => { byVehicle[v.id] = [] })

  allRecords.forEach((r) => {
    if (byVehicle[r.vehicle_id] && r.mileage != null) {
      byVehicle[r.vehicle_id].push({ date: r.date, mileage: Number(r.mileage) })
    }
  })

  const today = new Date().toISOString().slice(0, 10)
  vehicles.forEach((v) => {
    if (v.current_mileage != null) {
      byVehicle[v.id].push({ date: today, mileage: Number(v.current_mileage) })
    }
  })

  Object.values(byVehicle).forEach((series) => series.sort((a, b) => new Date(a.date) - new Date(b.date)))

  const dateSet = new Set()
  Object.values(byVehicle).forEach((series) => series.forEach((p) => dateSet.add(p.date)))
  const dates = [...dateSet].sort((a, b) => new Date(a) - new Date(b))

  return dates.map((date) => {
    const row = { date, ts: new Date(date).getTime() }
    vehicles.forEach((v) => {
      const point = byVehicle[v.id].find((p) => p.date === date)
      if (point) row[v.id] = point.mileage
    })
    return row
  })
}

export default function DashboardPage() {
  const { t, lang } = useLanguage()
  const { user, profile } = useAuth()
  const currency = profile?.currency || 'EUR'
  const { vehicles } = useVehicles()
  const { reminders, toggleReminder } = useReminders()
  const [allRecords, setAllRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      if (isLocalMode) {
        const allVehicles = localDB.read('vehicles', [])
        const myVehicleIds = new Set(allVehicles.filter((v) => v.user_id === user.id).map((v) => v.id))
        const allRecordsLocal = localDB
          .read('maintenance_records', [])
          .filter((r) => myVehicleIds.has(r.vehicle_id))
          .sort((a, b) => new Date(a.date) - new Date(b.date))
        setAllRecords(allRecordsLocal)
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('maintenance_records')
        .select('*, vehicles!inner(user_id)')
        .eq('vehicles.user_id', user.id)
        .order('date', { ascending: true })
      setAllRecords(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const currentYear = new Date().getFullYear()

  const yearRecords = useMemo(
    () => allRecords.filter((r) => new Date(r.date).getFullYear() === currentYear),
    [allRecords, currentYear]
  )

  const totalYear = useMemo(() => yearRecords.reduce((s, r) => s + (Number(r.cost) || 0), 0), [yearRecords])
  const totalAllTime = useMemo(() => allRecords.reduce((s, r) => s + (Number(r.cost) || 0), 0), [allRecords])

  const categoryData = useMemo(() => {
    const map = {}
    yearRecords.forEach((r) => {
      const label = categoryLabel(r.category, t)
      map[label] = (map[label] || 0) + (Number(r.cost) || 0)
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [yearRecords, t])

  const monthlyData = useMemo(() => {
    const monthsFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const labels = lang === 'en' ? monthsEn : monthsFr
    const totals = Array(12).fill(0)
    yearRecords.forEach((r) => {
      const m = new Date(r.date).getMonth()
      totals[m] += Number(r.cost) || 0
    })
    return labels.map((month, i) => ({ month, total: Math.round(totals[i]) }))
  }, [yearRecords, lang])

  const mileageSeries = useMemo(() => buildMileageSeries(vehicles, allRecords), [vehicles, allRecords])

  const spendPerVehicleData = useMemo(
    () => vehicles
      .map((v) => ({ name: `${v.make} ${v.model}`, value: Math.round(v.total_cost || 0) }))
      .sort((a, b) => b.value - a.value),
    [vehicles]
  )

  const upcomingReminders = useMemo(() => {
    return reminders
      .filter((r) => !r.is_completed)
      .map((r) => ({ ...r, _status: reminderStatus(r, r.vehicles?.current_mileage) }))
      .filter((r) => r._status !== 'ok')
      .sort((a, b) => (a._status === 'overdue' ? -1 : 1))
      .slice(0, 4)
  }, [reminders])

  return (
    <div className="animate-fade-in">
      <Header title={t('nav.dashboard')} />

      <div className="hidden md:block mb-6">
        <h1 className="font-display font-bold text-2xl tracking-wide">{t('dashboard.title')}</h1>
        <p className="text-base-400 text-sm mt-1">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4 md:mt-0">
        <StatCard icon={Wallet} label={t('dashboard.spentIn')(currentYear)} value={formatCurrency(totalYear, currency)} accent="mecha" />
        <StatCard icon={PiggyBank} label={t('dashboard.totalSpent')} value={formatCurrency(totalAllTime, currency)} accent="tech" />
        <StatCard icon={Wrench} label={t('dashboard.vehicles')} value={vehicles.length} accent="tech" />
        <StatCard icon={BellRing} label={t('dashboard.activeReminders')} value={reminders.filter((r) => !r.is_completed).length} accent="mecha" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm">{t('dashboard.monthlySpend')(currentYear)}</h3>
            <TrendingUp size={16} className="text-mecha" />
          </div>
          <MonthlySpendChart data={monthlyData} currency={currency} noDataLabel={t('dashboard.noData')} seriesLabel={t('dashboard.monthlySpendLegend')} />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-1">{t('dashboard.categoryBreakdown')}</h3>
          <CategoryBreakdownChart data={categoryData} currency={currency} noDataLabel={t('dashboard.noData')} />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-1">{t('dashboard.mileageEvolution')}</h3>
          <MileageEvolutionChart data={mileageSeries} vehicles={vehicles} lang={lang} noDataLabel={t('dashboard.noData')} />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-1">{t('dashboard.spendPerVehicle')}</h3>
          <SpendPerVehicleChart data={spendPerVehicleData} currency={currency} noDataLabel={t('dashboard.noData')} />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2"><BellRing size={16} className="text-amber-400" /> {t('dashboard.upcoming')}</h3>
          <Link to="/rappels" className="text-xs text-tech hover:text-tech-light flex items-center gap-1">
            {t('dashboard.viewAll')} <ArrowRight size={12} />
          </Link>
        </div>
        {upcomingReminders.length === 0 ? (
          <div className="card p-6 text-center text-sm text-base-400">{t('dashboard.allGood')}</div>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map((r) => (
              <ReminderWidget key={r.id} reminder={r} vehicle={r.vehicles} onToggle={toggleReminder} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  const accentClass = accent === 'mecha' ? 'text-mecha bg-mecha/10' : 'text-tech bg-tech/10'
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accentClass}`}>
        <Icon size={16} />
      </div>
      <p className="text-lg font-bold truncate">{value}</p>
      <p className="text-xs text-base-400 mt-0.5">{label}</p>
    </div>
  )
}
