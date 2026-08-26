import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

if (!hasSupabaseConfig) {
  console.info(
    '[FolioMeca] Aucune clé Supabase détectée : l\'application démarre en mode local ' +
    '(données stockées dans le navigateur). Renseignez VITE_SUPABASE_URL et ' +
    'VITE_SUPABASE_ANON_KEY dans .env.local pour activer la synchronisation cloud.'
  )
}

// En mode local, on évite d'appeler createClient() avec une URL vide (ce qui lève une
// exception immédiate) : on exporte un client "factice" jamais utilisé par les hooks,
// qui basculent eux-mêmes sur localStorage via isLocalMode (voir lib/localMode.js).
export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key')

// Buckets Supabase Storage attendus (à créer dans le dashboard Supabase) :
// - "vehicle-photos"  (public en lecture, écriture authentifiée)
// - "invoices"         (privé, accès via policies RLS storage)
export const BUCKETS = {
  VEHICLE_PHOTOS: 'vehicle-photos',
  INVOICES: 'invoices'
}
