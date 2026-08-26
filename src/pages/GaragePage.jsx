import { useState } from 'react'
import { Plus, Warehouse, Loader2 } from 'lucide-react'
import { useVehicles } from '../hooks/useVehicles'
import VehicleCard from '../components/vehicles/VehicleCard'
import AddVehicleModal from '../components/vehicles/AddVehicleModal'
import Header from '../components/layout/Header'
import { useLanguage } from '../context/LanguageContext'

export default function GaragePage() {
  const { t } = useLanguage()
  const { vehicles, loading, addVehicle } = useVehicles()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="animate-fade-in">
      <Header title={t('nav.garage')} />

      <div className="flex items-center justify-between mb-6 mt-4 md:mt-0">
        <div className="hidden md:block">
          <h1 className="font-display font-bold text-2xl tracking-wide">{t('garage.title')}</h1>
          <p className="text-base-400 text-sm mt-1">{t('garage.subtitle')(vehicles.length)}</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary md:ml-auto">
          <Plus size={18} /> <span className="hidden sm:inline">{t('garage.addVehicle')}</span><span className="sm:hidden">{t('common.add')}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-mecha" size={28} /></div>
      ) : vehicles.length === 0 ? (
        <div className="card p-10 text-center">
          <Warehouse size={32} className="mx-auto text-base-600 mb-3" />
          <p className="font-medium text-base-200">{t('garage.empty')}</p>
          <p className="text-sm text-base-500 mt-1 mb-4">{t('garage.emptyHint')}</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary mx-auto">
            <Plus size={18} /> {t('garage.addVehicle')}
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </div>
      )}

      <AddVehicleModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={addVehicle} />
    </div>
  )
}
