// Mode local : si aucune clé Supabase n'est configurée, l'app fonctionne
// entièrement avec localStorage (aucune installation, aucun compte requis).
// Dès que VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY sont renseignées dans
// .env.local, l'app bascule automatiquement sur Supabase.

export const isLocalMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY

const PREFIX = 'foliomeca_local_'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export const localDB = {
  read,
  write,
  uid: () => crypto.randomUUID(),

  // Convertit un fichier en data URL pour un stockage local simple (pas de vrai bucket en mode local)
  fileToDataUrl: (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
}

export function seedLocalDataIfEmpty() {
  const session = read('session', null)
  if (!session) return // on ne seed qu'après la première "connexion" locale

  const vehicles = read('vehicles', null)
  if (vehicles !== null) return // déjà initialisé

  const demoUserId = session.user.id
  const v1 = localDB.uid()
  const v2 = localDB.uid()

  write('vehicles', [
    {
      id: v1, user_id: demoUserId, type: 'auto', make: 'Peugeot', model: '308', year: 2019,
      vin: '', license_plate: 'AB-123-CD', current_mileage: 87420, image_url: null,
      created_at: new Date().toISOString()
    },
    {
      id: v2, user_id: demoUserId, type: 'moto', make: 'Yamaha', model: 'MT-07', year: 2021,
      vin: '', license_plate: 'EF-456-GH', current_mileage: 14230, image_url: null,
      created_at: new Date().toISOString()
    }
  ])

  write('maintenance_records', [
    {
      id: localDB.uid(), vehicle_id: v1, date: '2026-07-12', mileage: 85000, category: 'vidange',
      title: 'Vidange huile moteur + filtre', description: '', cost: 49.9,
      workshop_name: 'Fait maison', invoice_url: null, created_at: new Date().toISOString()
    },
    {
      id: localDB.uid(), vehicle_id: v1, date: '2026-06-02', mileage: 82400, category: 'pneus',
      title: 'Changement 4 pneus', description: '', cost: 520,
      workshop_name: 'Euromaster', invoice_url: null, created_at: new Date().toISOString()
    }
  ])

  write('reminders', [
    { id: localDB.uid(), vehicle_id: v1, title: 'Purger le liquide de frein', due_date: '2026-10-15', due_mileage: null, is_completed: false },
    { id: localDB.uid(), vehicle_id: v2, title: 'Chaîne de distribution', due_date: null, due_mileage: 32000, is_completed: false }
  ])
}
