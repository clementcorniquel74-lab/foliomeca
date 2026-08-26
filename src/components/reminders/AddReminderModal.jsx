import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from '../Modal'
import { useLanguage } from '../../context/LanguageContext'

const EMPTY_FORM = { title: '', due_date: '', due_mileage: '', vehicle_id: '' }

// reminder (optionnel) : si fourni, le modal passe en mode édition (pré-rempli, bouton "Enregistrer")
export default function AddReminderModal({ open, onClose, onSubmit, vehicles = [], defaultVehicleId, reminder = null }) {
  const { t } = useLanguage()
  const isEditMode = Boolean(reminder)
  const [form, setForm] = useState({ ...EMPTY_FORM, vehicle_id: defaultVehicleId || '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && reminder) {
      setForm({
        title: reminder.title || '',
        due_date: reminder.due_date || '',
        due_mileage: reminder.due_mileage ?? '',
        vehicle_id: reminder.vehicle_id || defaultVehicleId || ''
      })
    } else if (open) {
      setForm({ ...EMPTY_FORM, vehicle_id: defaultVehicleId || '' })
    }
  }, [open, reminder, defaultVehicleId])

  const reset = () => {
    setForm({ ...EMPTY_FORM, vehicle_id: defaultVehicleId || '' })
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.title || !form.vehicle_id) {
      setError(t('reminders.errorRequired'))
      return
    }
    if (!form.due_date && !form.due_mileage) {
      setError(t('reminders.errorDueMissing'))
      return
    }
    setLoading(true)
    const payload = {
      vehicle_id: form.vehicle_id,
      title: form.title,
      due_date: form.due_date || null,
      due_mileage: form.due_mileage ? Number(form.due_mileage) : null
    }
    const { error } = isEditMode
      ? await onSubmit(reminder.id, payload)
      : await onSubmit({ ...payload, is_completed: false })
    setLoading(false)
    if (error) setError(error.message)
    else handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title={isEditMode ? t('reminders.modalEditTitle') : t('reminders.modalNewTitle')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">{t('reminders.vehicleLabel')} *</label>
          <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required className="input">
            <option value="">{t('reminders.selectVehicle')}</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.make} {v.model} ({v.year})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">{t('reminders.titleLabel')} *</label>
          <input name="title" value={form.title} onChange={handleChange} required className="input" placeholder={t('reminders.titlePlaceholder')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('reminders.dueDate')}</label>
            <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">{t('reminders.dueMileage')}</label>
            <input type="number" name="due_mileage" value={form.due_mileage} onChange={handleChange} className="input" placeholder="90000" />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isEditMode ? t('common.saveChanges') : t('reminders.createReminder')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
