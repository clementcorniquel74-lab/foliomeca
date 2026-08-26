import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Car, Bike, Gauge, Wallet, Hash, CreditCard, ImageOff, Trash2, Loader2, Pencil, Printer } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../lib/supabaseClient'
import { isLocalMode, localDB } from '../lib/localMode'
import { useMaintenance } from '../hooks/useMaintenance'
import { useVehicles } from '../hooks/useVehicles'
import MaintenanceTimeline from '../components/maintenance/MaintenanceTimeline'
import AddMaintenanceModal from '../components/maintenance/AddMaintenanceModal'
import AddVehicleModal from '../components/vehicles/AddVehicleModal'
import VehicleDocuments from '../components/vehicles/VehicleDocuments'
import PrintableVehicleReport from '../components/vehicles/PrintableVehicleReport'
import PrintableMaintenanceRecord from '../components/maintenance/PrintableMaintenanceRecord'
import Header from '../components/layout/Header'
import { CATEGORIES, categoryLabel, formatCurrency, formatMileage } from '../utils/formatters'

export default function VehicleDetailPage() {
  const { t, lang } = useLanguage()
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const currency = profile?.currency || 'EUR'
  const [vehicle, setVehicle] = useState(null)
  const [loadingVehicle, setLoadingVehicle] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [printMode, setPrintMode] = useState(null) // null | 'full' | <recordId>

  const { records, loading: loadingRecords, addRecord, updateRecord, deleteRecord } = useMaintenance(vehicleId)
  const { updateVehicle } = useVehicles()

  const loadVehicle = async () => {
    setLoadingVehicle(true)
    if (isLocalMode) {
      const all = localDB.read('vehicles', [])
      setVehicle(all.find((v) => v.id === vehicleId) || null)
      setLoadingVehicle(false)
      return
    }
    const { data } = await supabase.from('vehicles').select('*').eq('id', vehicleId).single()
    setVehicle(data)
    setLoadingVehicle(false)
  }

  useEffect(() => {
    if (vehicleId) loadVehicle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId])

  // Déclenche l'impression navigateur une fois le contenu à imprimer monté, puis nettoie l'état.
  useEffect(() => {
    if (!printMode) return
    const t = setTimeout(() => window.print(), 50)
    const handleAfterPrint = () => setPrintMode(null)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => {
      clearTimeout(t)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [printMode])

  const totalCost = useMemo(() => records.reduce((s, r) => s + (Number(r.cost) || 0), 0), [records])

  const filteredRecords = useMemo(() => {
    if (categoryFilter === 'all') return records
    return records.filter((r) => r.category === categoryFilter)
  }, [records, categoryFilter])

  const recordToPrint = useMemo(() => {
    if (!printMode || printMode === 'full') return null
    return records.find((r) => r.id === printMode) || null
  }, [printMode, records])

  const handleUpdateMileage = async (mileage) => {
    if (isLocalMode) {
      const all = localDB.read('vehicles', [])
      localDB.write('vehicles', all.map((v) => (v.id === vehicleId ? { ...v, current_mileage: mileage } : v)))
      loadVehicle()
      return
    }
    await supabase.from('vehicles').update({ current_mileage: mileage }).eq('id', vehicleId)
    loadVehicle()
  }

  const handleEditVehicle = async (updates, imageFile) => {
    const { error } = await updateVehicle(vehicleId, updates, imageFile)
    if (!error) await loadVehicle()
    return { error }
  }

  const handleDeleteVehicle = async () => {
    if (!confirm(t('vehicle.deleteConfirm'))) return
    if (isLocalMode) {
      const all = localDB.read('vehicles', [])
      localDB.write('vehicles', all.filter((v) => v.id !== vehicleId))
      const records = localDB.read('maintenance_records', [])
      localDB.write('maintenance_records', records.filter((r) => r.vehicle_id !== vehicleId))
      const reminders = localDB.read('reminders', [])
      localDB.write('reminders', reminders.filter((r) => r.vehicle_id !== vehicleId))
      const docs = localDB.read('vehicle_documents', [])
      localDB.write('vehicle_documents', docs.filter((d) => d.vehicle_id !== vehicleId))
      navigate('/garage')
      return
    }
    await supabase.from('vehicles').delete().eq('id', vehicleId)
    navigate('/garage')
  }

  const openAddRecordModal = () => {
    setEditingRecord(null)
    setModalOpen(true)
  }

  const openEditRecordModal = (record) => {
    setEditingRecord(record)
    setModalOpen(true)
  }

  const closeRecordModal = () => {
    setModalOpen(false)
    setEditingRecord(null)
  }

  const handleSubmitRecord = async (payload, invoiceFile) => {
    if (editingRecord) return updateRecord(editingRecord.id, payload, invoiceFile)
    return addRecord(payload, invoiceFile)
  }

  if (loadingVehicle) {
    return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-mecha" size={28} /></div>
  }

  if (!vehicle || vehicle.user_id !== user?.id) {
    return (
      <div className="card p-8 text-center">
        <p className="text-base-300">{t('vehicle.notFound')}</p>
        <Link to="/garage" className="text-tech text-sm mt-2 inline-block">{t('common.backToGarage')}</Link>
      </div>
    )
  }

  const isMoto = vehicle.type === 'moto'

  return (
    <>
    <div className="animate-fade-in print:hidden">
      <Header title={`${vehicle.make} ${vehicle.model}`} />

      <div className="flex items-center justify-between mb-4 mt-2 md:mt-0">
        <button onClick={() => navigate('/garage')} className="btn-ghost -ml-3">
          <ArrowLeft size={16} /> {t('common.backToGarage')}
        </button>
        <button onClick={() => setPrintMode('full')} className="btn-secondary text-sm py-2">
          <Printer size={16} /> <span className="hidden sm:inline">{t('vehicle.saleReport')}</span>
        </button>
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="relative h-48 md:h-64 bg-base-800">
          {vehicle.image_url ? (
            <img src={vehicle.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base-600">
              <ImageOff size={40} />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-base-950 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <span className={isMoto ? 'badge-moto' : 'badge-auto'}>
                {isMoto ? <Bike size={12} /> : <Car size={12} />}
                {isMoto ? t('vehicle.moto') : t('vehicle.auto')}
              </span>
              <h1 className="font-display font-bold text-2xl tracking-wide mt-1.5">{vehicle.make} {vehicle.model}</h1>
              <p className="text-sm text-base-300">{vehicle.year}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditModalOpen(true)} className="text-base-300 hover:text-tech bg-base-950/60 backdrop-blur p-2 rounded-lg transition-colors">
                <Pencil size={16} />
              </button>
              <button onClick={handleDeleteVehicle} className="text-base-300 hover:text-red-400 bg-base-950/60 backdrop-blur p-2 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-base-700/60 border-t border-base-700/60">
          <InfoStat icon={Gauge} label={t('vehicle.mileage')} value={formatMileage(vehicle.current_mileage, lang)} />
          <InfoStat icon={Wallet} label={t('vehicle.totalSpent')} value={formatCurrency(totalCost, currency)} />
          <InfoStat icon={Hash} label={t('vehicle.plate')} value={vehicle.license_plate || '—'} />
          <InfoStat icon={CreditCard} label={t('vehicle.vin')} value={vehicle.vin || '—'} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">{t('vehicle.history')}</h2>
        <button onClick={openAddRecordModal} className="btn-primary text-sm py-2">
          <Plus size={16} /> {t('common.add')}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        <FilterChip active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')} label={t('vehicle.all')} />
        {CATEGORIES.map((c) => (
          <FilterChip key={c.value} active={categoryFilter === c.value} onClick={() => setCategoryFilter(c.value)} label={categoryLabel(c.value, t)} color={c.color} />
        ))}
      </div>

      {loadingRecords ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-mecha" size={24} /></div>
      ) : (
        <MaintenanceTimeline
          records={filteredRecords}
          onDelete={deleteRecord}
          onEdit={openEditRecordModal}
          onPrint={(id) => setPrintMode(id)}
        />
      )}

      <VehicleDocuments vehicleId={vehicleId} />

      <AddMaintenanceModal
        open={modalOpen}
        onClose={closeRecordModal}
        onSubmit={handleSubmitRecord}
        currentMileage={vehicle.current_mileage}
        onUpdateMileage={handleUpdateMileage}
        record={editingRecord}
      />

      <AddVehicleModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditVehicle}
        vehicle={vehicle}
      />

    </div>
      {printMode === 'full' && <PrintableVehicleReport vehicle={vehicle} records={records} currency={currency} />}
      {recordToPrint && <PrintableMaintenanceRecord vehicle={vehicle} record={recordToPrint} currency={currency} />}
    </>
  )
}

function InfoStat({ icon: Icon, label, value }) {
  return (
    <div className="p-3.5 md:p-4">
      <div className="flex items-center gap-1.5 text-base-400 mb-1">
        <Icon size={12} />
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="font-semibold text-sm truncate">{value}</p>
    </div>
  )
}

function FilterChip({ active, onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        active ? 'text-base-950' : 'text-base-300 border-base-600 hover:border-base-500'
      }`}
      style={active ? { backgroundColor: color || '#FF6A1A', borderColor: color || '#FF6A1A' } : {}}
    >
      {label}
    </button>
  )
}
