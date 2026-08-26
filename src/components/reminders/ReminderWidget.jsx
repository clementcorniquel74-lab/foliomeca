import { BellRing, CheckCircle2, Circle, Trash2, Pencil, Calendar, Gauge } from 'lucide-react'
import { formatDate, formatMileage, reminderStatus, daysUntil } from '../../utils/formatters'
import { useLanguage } from '../../context/LanguageContext'

export default function ReminderWidget({ reminder, vehicle, onToggle, onDelete, onEdit, compact = false }) {
  const { t, lang } = useLanguage()
  const STATUS_STYLES = {
    overdue: { dot: 'bg-red-500', text: 'text-red-400', label: t('reminders.overdue') },
    soon: { dot: 'bg-amber-500', text: 'text-amber-400', label: t('reminders.soon') },
    ok: { dot: 'bg-emerald-500', text: 'text-emerald-400', label: t('reminders.ok') }
  }
  const currentMileage = vehicle?.current_mileage
  const status = reminder.is_completed ? null : reminderStatus(reminder, currentMileage)
  const style = status ? STATUS_STYLES[status] : null
  const days = daysUntil(reminder.due_date)
  const kmLeft = reminder.due_mileage != null && currentMileage != null ? reminder.due_mileage - currentMileage : null

  return (
    <div className={`card p-4 flex items-start gap-3 ${reminder.is_completed ? 'opacity-50' : ''}`}>
      <button onClick={() => onToggle(reminder.id, !reminder.is_completed)} className="mt-0.5 shrink-0">
        {reminder.is_completed ? (
          <CheckCircle2 size={20} className="text-emerald-500" />
        ) : (
          <Circle size={20} className="text-base-500 hover:text-mecha transition-colors" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {!compact && vehicle && (
            <span className="text-xs font-medium text-base-400">{vehicle.make} {vehicle.model} •</span>
          )}
          {style && (
            <span className={`flex items-center gap-1 text-xs font-semibold ${style.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          )}
        </div>
        <p className={`font-medium ${reminder.is_completed ? 'line-through text-base-500' : 'text-base-100'}`}>
          {reminder.title}
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-base-400 flex-wrap">
          {reminder.due_date && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(reminder.due_date, lang)}
              {!reminder.is_completed && days !== null && ` (${days >= 0 ? t('reminders.inDays')(days) : t('reminders.overdueDays')(Math.abs(days))})`}
            </span>
          )}
          {reminder.due_mileage != null && (
            <span className="flex items-center gap-1">
              <Gauge size={12} />
              {formatMileage(reminder.due_mileage, lang)}
              {!reminder.is_completed && kmLeft !== null && ` (${kmLeft >= 0 ? t('reminders.inKm')(formatMileage(kmLeft, lang)) : t('reminders.overdueKm')(formatMileage(Math.abs(kmLeft), lang))})`}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onEdit && (
          <button
            onClick={() => onEdit(reminder)}
            className="text-base-500 hover:text-tech p-1.5 rounded-lg hover:bg-tech/10 transition-colors"
            title={t('common.edit')}
          >
            <Pencil size={14} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(reminder.id)}
            className="text-base-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
            title={t('common.delete')}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export function ReminderStatusIcon() {
  return <BellRing size={16} />
}
