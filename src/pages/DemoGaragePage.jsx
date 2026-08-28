import { Link } from 'react-router-dom'
import { ArrowLeft, Gauge, Wrench } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { MonthlySpendChart, CategoryBreakdownChart } from '../components/dashboard/StatsCharts'

const DEMO_MONTHLY_SPEND = [
  { month: 'Jan', total: 45 },
  { month: 'Fév', total: 120 },
  { month: 'Mar', total: 30 },
  { month: 'Avr', total: 210 },
  { month: 'Mai', total: 60 },
  { month: 'Juin', total: 95 }
]

const DEMO_CATEGORY_BREAKDOWN = [
  { name: 'Entretien / Vidange', value: 180 },
  { name: 'Pneus', value: 320 },
  { name: 'Freins', value: 95 },
  { name: 'Autre', value: 40 }
]

const DEMO_VEHICLES = [
  {
    key: 'vehicle1',
    type: 'Auto',
    badgeClass: 'badge-auto',
    mileage: '84 320 km',
    items: ['item1', 'item2', 'item3']
  },
  {
    key: 'vehicle2',
    type: 'Moto',
    badgeClass: 'badge-moto',
    mileage: '18 940 km',
    items: ['item4', 'item5', 'item3']
  }
]

export default function DemoGaragePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-base-950 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/connexion" className="btn-ghost text-sm">
            <ArrowLeft size={16} />
            {t('demo.backToLogin')}
          </Link>
          <Link to="/connexion" className="btn-primary text-sm">
            {t('demo.createMine')}
          </Link>
        </div>

        <div className="mb-8 text-center text-xs text-tech-light bg-tech/10 border border-tech/25 rounded-lg px-3 py-2">
          {t('demo.banner')}
        </div>

        <div className="mb-10">
          <h2 className="font-display font-semibold text-lg">{t('demo.spendOverviewTitle')}</h2>
          <p className="text-sm text-base-400 mb-4">{t('demo.spendOverviewSubtitle')}</p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-1">{t('demo.monthlySpend')}</h3>
              <MonthlySpendChart data={DEMO_MONTHLY_SPEND} seriesLabel={t('demo.monthlySpendLegend')} />
            </div>
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-1">{t('demo.categoryBreakdown')}</h3>
              <CategoryBreakdownChart data={DEMO_CATEGORY_BREAKDOWN} />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {DEMO_VEHICLES.map((vehicle) => (
            <div key={vehicle.key} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-base-100">{t(`demo.${vehicle.key}`)}</p>
                  <span className={`${vehicle.badgeClass} mt-1`}>{vehicle.type}</span>
                </div>
                <div className="flex items-center gap-1.5 text-tech-light text-sm font-medium">
                  <Gauge size={16} />
                  {vehicle.mileage}
                </div>
              </div>
              <div className="h-px bg-base-700 mb-4" />
              <p className="text-xs font-medium text-base-400 uppercase tracking-wide mb-3">
                {t('demo.historyTitle')}
              </p>
              <ul className="space-y-2.5">
                {vehicle.items.map((itemKey, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-base-200">
                    <Wrench size={14} className="text-mecha shrink-0" />
                    {t(`demo.${itemKey}`)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
