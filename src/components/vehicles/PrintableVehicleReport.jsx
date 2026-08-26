import { categoryMeta, formatCurrency, formatDate, formatMileage } from '../../utils/formatters'

// Rendu masqué à l'écran (voir règle @media print dans index.css), affiché uniquement à l'impression / export PDF navigateur.
export default function PrintableVehicleReport({ vehicle, records, currency }) {
  if (!vehicle) return null

  const totalCost = records.reduce((s, r) => s + (Number(r.cost) || 0), 0)
  const isMoto = vehicle.type === 'moto'

  return (
    <div id="print-report" className="hidden print:block p-10 text-black">
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Rapport d'entretien — {vehicle.make} {vehicle.model}</h1>
          <p className="text-sm text-gray-600 mt-1">Généré le {formatDate(new Date().toISOString())} via FolioMeca</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{isMoto ? 'Moto / Scooter' : 'Automobile'}</p>
          <p>{vehicle.year}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8 text-sm">
        <div><p className="text-gray-500">Kilométrage</p><p className="font-semibold">{formatMileage(vehicle.current_mileage)}</p></div>
        <div><p className="text-gray-500">Immatriculation</p><p className="font-semibold">{vehicle.license_plate || '—'}</p></div>
        <div><p className="text-gray-500">VIN</p><p className="font-semibold">{vehicle.vin || '—'}</p></div>
        <div><p className="text-gray-500">Total entretiens</p><p className="font-semibold">{formatCurrency(totalCost, currency)}</p></div>
      </div>

      <h2 className="text-lg font-bold border-b border-gray-300 pb-2 mb-4">Historique d'entretien ({records.length} intervention{records.length > 1 ? 's' : ''})</h2>

      {records.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun entretien enregistré.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b-2 border-black">
              <th className="py-2 pr-3">Date</th>
              <th className="py-2 pr-3">Kilométrage</th>
              <th className="py-2 pr-3">Catégorie</th>
              <th className="py-2 pr-3">Intervention</th>
              <th className="py-2 pr-3">Réalisé par</th>
              <th className="py-2 text-right">Coût</th>
            </tr>
          </thead>
          <tbody>
            {[...records].sort((a, b) => new Date(a.date) - new Date(b.date)).map((r) => (
              <tr key={r.id} className="border-b border-gray-200">
                <td className="py-2 pr-3 whitespace-nowrap">{formatDate(r.date)}</td>
                <td className="py-2 pr-3 whitespace-nowrap">{formatMileage(r.mileage)}</td>
                <td className="py-2 pr-3">{categoryMeta(r.category).label}</td>
                <td className="py-2 pr-3">{r.title}</td>
                <td className="py-2 pr-3">{r.workshop_name || '—'}</td>
                <td className="py-2 text-right whitespace-nowrap">{formatCurrency(r.cost, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="text-xs text-gray-400 mt-10 border-t border-gray-300 pt-4">
        Document généré automatiquement à partir du carnet d'entretien numérique FolioMeca — à conserver pour la vente du véhicule.
      </p>
    </div>
  )
}
