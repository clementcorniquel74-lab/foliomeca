import { categoryMeta, formatCurrency, formatDate, formatMileage } from '../../utils/formatters'

// Rendu masqué à l'écran (voir règle @media print dans index.css), affiché uniquement à l'impression / export PDF navigateur.
export default function PrintableMaintenanceRecord({ vehicle, record, currency }) {
  if (!vehicle || !record) return null

  const meta = categoryMeta(record.category)
  const isHome = !record.workshop_name || record.workshop_name.toLowerCase().includes('maison')

  return (
    <div id="print-report" className="hidden print:block p-10 text-black">
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fiche d'entretien — {vehicle.make} {vehicle.model}</h1>
          <p className="text-sm text-gray-600 mt-1">Généré le {formatDate(new Date().toISOString())} via FolioMeca</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{vehicle.year}</p>
          <p>{vehicle.license_plate || '—'}</p>
        </div>
      </div>

      <div className="mb-6">
        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full border border-black">
          {meta.label}
        </span>
      </div>

      <h2 className="text-xl font-bold mb-4">{record.title}</h2>

      <div className="grid grid-cols-2 gap-6 text-sm mb-6">
        <div><p className="text-gray-500">Date</p><p className="font-semibold">{formatDate(record.date)}</p></div>
        <div><p className="text-gray-500">Kilométrage</p><p className="font-semibold">{formatMileage(record.mileage)}</p></div>
        <div><p className="text-gray-500">Réalisé par</p><p className="font-semibold">{isHome ? 'Fait maison' : record.workshop_name}</p></div>
        <div><p className="text-gray-500">Coût</p><p className="font-semibold">{formatCurrency(record.cost, currency)}</p></div>
      </div>

      {record.description && (
        <div className="mb-6">
          <p className="text-gray-500 text-sm mb-1">Remarques</p>
          <p className="text-sm border border-gray-300 rounded-lg p-3">{record.description}</p>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-10 border-t border-gray-300 pt-4">
        Document généré automatiquement à partir du carnet d'entretien numérique FolioMeca.
      </p>
    </div>
  )
}
