import { useMemo, useState } from 'react'
import { Plus, BellRing, Loader2 } from 'lucide-react'
import { useReminders } from '../hooks/useReminders'
import { useVehicles } from '../hooks/useVehicles'
import ReminderWidget from '../components/reminders/ReminderWidget'
import AddReminderModal from '../components/reminders/AddReminderModal'
import Header from '../components/layout/Header'
import { reminderStatus } from '../utils/formatters'
import { useLanguage } from '../context/LanguageContext'

export default function RemindersPage() {
  const { t } = useLanguage()
  const { reminders, loading, addReminder, updateReminder, toggleReminder, deleteReminder } = useReminders()
  const { vehicles } = useVehicles()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [tab, setTab] = useState('active')

  const sorted = useMemo(() => {
    const list = reminders.filter((r) => (tab === 'active' ? !r.is_completed : r.is_completed))
    return [...list].sort((a, b) => {
      const sa = reminderStatus(a, a.vehicles?.current_mileage)
      const sb = reminderStatus(b, b.vehicles?.current_mileage)
      const order = { overdue: 0, soon: 1, ok: 2 }
      return (order[sa] ?? 3) - (order[sb] ?? 3)
    })
  }, [reminders, tab])

  const openAddModal = () => {
    setEditingReminder(null)
    setModalOpen(true)
  }

  const openEditModal = (reminder) => {
    setEditingReminder(reminder)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingReminder(null)
  }

  const handleSubmit = async (a, b) => {
    // En mode édition, AddReminderModal appelle onSubmit(id, payload) ; en création, onSubmit(payload)
    if (editingReminder) return updateReminder(a, b)
    return addReminder(a)
  }

  return (
    <div className="animate-fade-in">
      <Header title={t('nav.reminders')} />

      <div className="flex items-center justify-between mb-4 mt-4 md:mt-0">
        <div className="hidden md:block">
          <h1 className="font-display font-bold text-2xl tracking-wide">{t('reminders.title')}</h1>
          <p className="text-base-400 text-sm mt-1">{t('reminders.subtitle')}</p>
        </div>
        <button onClick={openAddModal} className="btn-primary md:ml-auto" disabled={vehicles.length === 0}>
          <Plus size={18} /> <span className="hidden sm:inline">{t('reminders.newReminder')}</span><span className="sm:hidden">{t('common.add')}</span>
        </button>
      </div>

      <div className="flex bg-base-800 rounded-lg p-1 mb-5 max-w-xs">
        <button
          onClick={() => setTab('active')}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'active' ? 'bg-base-700 text-base-100' : 'text-base-400'}`}
        >
          {t('reminders.active')}
        </button>
        <button
          onClick={() => setTab('done')}
          className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'done' ? 'bg-base-700 text-base-100' : 'text-base-400'}`}
        >
          {t('reminders.done')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-mecha" size={28} /></div>
      ) : sorted.length === 0 ? (
        <div className="card p-10 text-center">
          <BellRing size={28} className="mx-auto text-base-600 mb-3" />
          <p className="text-base-300">{tab === 'active' ? t('reminders.emptyActive') : t('reminders.emptyDone')}</p>
          {vehicles.length === 0 && <p className="text-sm text-base-500 mt-1">{t('reminders.addVehicleFirst')}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => (
            <ReminderWidget key={r.id} reminder={r} vehicle={r.vehicles} onToggle={toggleReminder} onDelete={deleteReminder} onEdit={openEditModal} />
          ))}
        </div>
      )}

      <AddReminderModal open={modalOpen} onClose={closeModal} onSubmit={handleSubmit} vehicles={vehicles} reminder={editingReminder} />
    </div>
  )
}
