import { useEffect, useState } from 'react'
import { Upload, Loader2, FileText, Home, Building2 } from 'lucide-react'
import Modal from '../Modal'
import { CATEGORIES, categoryLabel } from '../../utils/formatters'
import { useLanguage } from '../../context/LanguageContext'

const today = () => new Date().toISOString().slice(0, 10)

const EMPTY_FORM = {
  date: today(),
  mileage: '',
  category: 'vidange',
  title: '',
  description: '',
  cost: '',
  workshop_name: ''
}

// record (optionnel) : si fourni, le modal passe en mode édition (pré-rempli, bouton "Enregistrer les modifications")
export default function AddMaintenanceModal({ open, onClose, onSubmit, currentMileage, onUpdateMileage, record = null }) {
  const { t } = useLanguage()
  const isEditMode = Boolean(record)
  const [form, setForm] = useState({ ...EMPTY_FORM, mileage: currentMileage || '' })
  const [doneAtHome, setDoneAtHome] = useState(true)
  const [invoiceFile, setInvoiceFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [updateMileage, setUpdateMileage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && record) {
      const isHome = !record.workshop_name || record.workshop_name.toLowerCase().includes('maison')
      setForm({
        date: record.date || today(),
        mileage: record.mileage ?? '',
        category: record.category || 'vidange',
        title: record.title || '',
        description: record.description || '',
        cost: record.cost ?? '',
        workshop_name: isHome ? '' : (record.workshop_name || '')
      })
      setDoneAtHome(isHome)
      setPreview(record.invoice_url || null)
      setUpdateMileage(false)
    } else if (open) {
      setForm({ ...EMPTY_FORM, mileage: currentMileage || '' })
      setDoneAtHome(true)
      setPreview(null)
      setUpdateMileage(true)
    }
  }, [open, record, currentMileage])

  const reset = () => {
    setForm({ ...EMPTY_FORM, mileage: currentMileage || '' })
    setDoneAtHome(true)
    setInvoiceFile(null)
    setPreview(null)
    setUpdateMileage(true)
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setInvoiceFile(file)
    if (file.type.startsWith('image/')) setPreview(URL.createObjectURL(file))
    else setPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.title || !form.date) {
      setError(t('addMaintenance.errorRequired'))
      return
    }
    setLoading(true)

    const payload = {
      date: form.date,
      mileage: form.mileage ? Number(form.mileage) : null,
      category: form.category,
      title: form.title,
      description: form.description || null,
      cost: form.cost ? Number(form.cost) : 0,
      workshop_name: doneAtHome ? 'Fait maison' : (form.workshop_name || 'Garage'),
      invoice_url: record?.invoice_url ?? null
    }

    const { error } = await onSubmit(payload, invoiceFile)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (updateMileage && form.mileage) {
      await onUpdateMileage(Number(form.mileage))
    }

    setLoading(false)
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title={isEditMode ? t('addMaintenance.titleEdit') : t('addMaintenance.titleNew')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('addMaintenance.date')} *</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required className="input" />
          </div>
          <div>
            <label className="label">{t('addMaintenance.mileage')}</label>
            <input type="number" name="mileage" value={form.mileage} onChange={handleChange} className="input" placeholder="85000" />
          </div>
        </div>

        <div>
          <label className="label">{t('addMaintenance.category')}</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: c.value }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  form.category === c.value ? 'text-base-950' : 'text-base-300 border-base-600 hover:border-base-500'
                }`}
                style={form.category === c.value ? { backgroundColor: c.color, borderColor: c.color } : {}}
              >
                {categoryLabel(c.value, t)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">{t('addMaintenance.interventionTitle')} *</label>
          <input name="title" value={form.title} onChange={handleChange} required className="input" placeholder={t('addMaintenance.interventionPlaceholder')} />
        </div>

        <div>
          <label className="label">{t('addMaintenance.notes')}</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input resize-none" placeholder={t('addMaintenance.notesPlaceholder')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('addMaintenance.cost')}</label>
            <input type="number" step="0.01" name="cost" value={form.cost} onChange={handleChange} className="input" placeholder="49.90" />
          </div>
          <div>
            <label className="label">{t('addMaintenance.doneBy')}</label>
            <div className="flex rounded-lg bg-base-800 p-1 border border-base-600">
              <button
                type="button"
                onClick={() => setDoneAtHome(true)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${doneAtHome ? 'bg-base-700 text-base-100' : 'text-base-400'}`}
              >
                <Home size={13} /> {t('addMaintenance.home')}
              </button>
              <button
                type="button"
                onClick={() => setDoneAtHome(false)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${!doneAtHome ? 'bg-base-700 text-base-100' : 'text-base-400'}`}
              >
                <Building2 size={13} /> {t('addMaintenance.garage')}
              </button>
            </div>
          </div>
        </div>

        {!doneAtHome && (
          <div>
            <label className="label">{t('addMaintenance.workshopName')}</label>
            <input name="workshop_name" value={form.workshop_name} onChange={handleChange} className="input" placeholder={t('addMaintenance.workshopPlaceholder')} />
          </div>
        )}

        <div>
          <label className="label">{t('addMaintenance.invoiceLabel')}</label>
          <label className="flex items-center gap-3 border border-dashed border-base-600 rounded-xl px-4 py-3 cursor-pointer hover:border-tech transition-colors">
            <div className="w-14 h-14 rounded-lg bg-base-800 flex items-center justify-center overflow-hidden shrink-0">
              {preview ? (
                <img src={preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <FileText size={20} className="text-base-500" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium flex items-center gap-1.5"><Upload size={14} /> {isEditMode ? t('addMaintenance.replaceFile') : t('addMaintenance.uploadFile')}</p>
              <p className="text-xs text-base-400 truncate">{invoiceFile?.name || (isEditMode ? t('addMaintenance.keepInvoiceHint') : t('addMaintenance.invoiceHint'))}</p>
            </div>
            <input type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
          </label>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-base-300 cursor-pointer">
          <input
            type="checkbox"
            checked={updateMileage}
            onChange={(e) => setUpdateMileage(e.target.checked)}
            className="w-4 h-4 rounded accent-mecha"
          />
          {t('addMaintenance.updateMileageCheckbox')}
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isEditMode ? t('common.saveChanges') : t('addMaintenance.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
