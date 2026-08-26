import { useEffect, useState } from 'react'
import { Car, Bike, Upload, Loader2, ImageOff } from 'lucide-react'
import Modal from '../Modal'
import { useLanguage } from '../../context/LanguageContext'

const EMPTY_FORM = {
  type: 'auto',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  vin: '',
  license_plate: '',
  current_mileage: ''
}

// vehicle (optionnel) : si fourni, le modal passe en mode édition (pré-rempli, bouton "Enregistrer")
export default function AddVehicleModal({ open, onClose, onSubmit, vehicle = null }) {
  const { t } = useLanguage()
  const isEditMode = Boolean(vehicle)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (open && vehicle) {
      setForm({
        type: vehicle.type || 'auto',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        vin: vehicle.vin || '',
        license_plate: vehicle.license_plate || '',
        current_mileage: vehicle.current_mileage ?? ''
      })
      setPreview(vehicle.image_url || null)
    } else if (open) {
      setForm(EMPTY_FORM)
      setPreview(null)
    }
  }, [open, vehicle])

  const reset = () => {
    setForm(EMPTY_FORM)
    setImageFile(null)
    setPreview(null)
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.make || !form.model) {
      setError(t('addVehicle.errorRequired'))
      return
    }
    setLoading(true)
    const { error } = await onSubmit(
      {
        ...form,
        year: form.year ? Number(form.year) : null,
        current_mileage: form.current_mileage ? Number(form.current_mileage) : 0,
        image_url: vehicle?.image_url ?? null
      },
      imageFile
    )
    setLoading(false)
    if (error) setError(error.message)
    else handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title={isEditMode ? t('addVehicle.titleEdit') : t('addVehicle.titleNew')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">{t('addVehicle.type')}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'auto' }))}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                form.type === 'auto' ? 'border-tech bg-tech/10 text-tech-light' : 'border-base-600 text-base-300 hover:border-base-500'
              }`}
            >
              <Car size={18} /> {t('vehicle.auto')}
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: 'moto' }))}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                form.type === 'moto' ? 'border-mecha bg-mecha/10 text-mecha-light' : 'border-base-600 text-base-300 hover:border-base-500'
              }`}
            >
              <Bike size={18} /> {t('vehicle.moto')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('addVehicle.make')} *</label>
            <input name="make" value={form.make} onChange={handleChange} required className="input" placeholder={form.type === 'moto' ? 'Yamaha' : 'Mercedes'} />
          </div>
          <div>
            <label className="label">{t('addVehicle.model')} *</label>
            <input name="model" value={form.model} onChange={handleChange} required className="input" placeholder={form.type === 'moto' ? 'R1' : 'A45 AMG'} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('addVehicle.year')}</label>
            <input type="number" name="year" value={form.year} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">{t('addVehicle.currentMileage')}</label>
            <input type="number" name="current_mileage" value={form.current_mileage} onChange={handleChange} className="input" placeholder="0" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('addVehicle.plate')}</label>
            <input name="license_plate" value={form.license_plate} onChange={handleChange} className="input" placeholder="AB-123-CD" />
          </div>
          <div>
            <label className="label">{t('addVehicle.vin')}</label>
            <input name="vin" value={form.vin} onChange={handleChange} className="input" placeholder="VF3..." />
          </div>
        </div>

        <div>
          <label className="label">{t('addVehicle.photo')}</label>
          <label className="flex items-center gap-3 border border-dashed border-base-600 rounded-xl px-4 py-3 cursor-pointer hover:border-tech transition-colors">
            <div className="w-14 h-14 rounded-lg bg-base-800 flex items-center justify-center overflow-hidden shrink-0">
              {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <ImageOff size={20} className="text-base-500" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium flex items-center gap-1.5"><Upload size={14} /> {isEditMode ? t('addVehicle.changePhoto') : t('addVehicle.choosePhoto')}</p>
              <p className="text-xs text-base-400 truncate">{imageFile?.name || (isEditMode ? t('addVehicle.keepPhotoHint') : t('addVehicle.photoHint'))}</p>
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="btn-secondary flex-1">{t('common.cancel')}</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isEditMode ? t('common.saveChanges') : t('addVehicle.addToGarage')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
