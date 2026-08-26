import { Wrench, Home, Building2, FileText, Trash2, Pencil, Printer } from 'lucide-react'
import { categoryLabel, categoryMeta, formatCurrency, formatDate, formatMileage } from '../../utils/formatters'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function MaintenanceTimeline({ records, onDelete, onEdit, onPrint }) {
  const { profile } = useAuth()
  const { t, lang } = useLanguage()
  const currency = profile?.currency || 'EUR'
  if (!records.length) {
    return (
      <div className="card p-8 text-center">
        <Wrench size={28} className="mx-auto text-base-600 mb-3" />
        <p className="text-base-300 font-medium">{t('maintenance.empty')}</p>
        <p className="text-sm text-base-500 mt-1">{t('maintenance.emptyHint')}</p>
      </div>
    )
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-base-700" />
      <div className="space-y-4">
        {records.map((r) => {
          const meta = categoryMeta(r.category)
          const isHome = !r.workshop_name || r.workshop_name.toLowerCase().includes('maison')
          return (
            <div key={r.id} className="relative animate-fade-in">
              <span
                className="absolute -left-6 top-1.5 w-[18px] h-[18px] rounded-full border-2 border-base-950"
                style={{ backgroundColor: meta.color }}
              />
              <div className="card p-4 hover:border-base-600 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                      >
                        {categoryLabel(r.category, t)}
                      </span>
                      <span className="text-xs text-base-400">{formatDate(r.date, lang)}</span>
                    </div>
                    <h4 className="font-semibold text-base-100">{r.title}</h4>
                    {r.description && <p className="text-sm text-base-400 mt-1">{r.description}</p>}

                    <div className="flex items-center gap-4 mt-3 text-xs text-base-400 flex-wrap">
                      <span>{formatMileage(r.mileage, lang)}</span>
                      <span className="flex items-center gap-1">
                        {isHome ? <Home size={12} /> : <Building2 size={12} />}
                        {isHome ? t('maintenance.home') : r.workshop_name}
                      </span>
                      {r.invoice_url && (
                        <a
                          href={r.invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-tech hover:text-tech-light"
                        >
                          <FileText size={12} /> {t('maintenance.invoice')}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-bold text-mecha-light whitespace-nowrap">{formatCurrency(r.cost, currency)}</span>
                    <div className="flex items-center gap-1">
                      {onPrint && (
                        <button
                          onClick={() => onPrint(r.id)}
                          className="text-base-500 hover:text-tech p-1 rounded-lg hover:bg-tech/10 transition-colors"
                          title={t('maintenance.print')}
                        >
                          <Printer size={14} />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(r)}
                          className="text-base-500 hover:text-tech p-1 rounded-lg hover:bg-tech/10 transition-colors"
                          title={t('common.edit')}
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(r.id)}
                          className="text-base-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
