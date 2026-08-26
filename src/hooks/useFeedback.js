import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isLocalMode, localDB } from '../lib/localMode'
import { useAuth } from '../context/AuthContext'

// Gère la table `feedback` (avis / suggestions des utilisateurs), avec le
// même mécanisme de repli local que les autres hooks de l'app.
export function useFeedback() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    if (!user) return
    setLoading(true)
    if (isLocalMode) {
      const all = localDB.read('feedback', [])
      setItems(all.filter((f) => f.user_id === user.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setItems(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addFeedback = useCallback(async ({ type, message }) => {
    if (!user) return { error: { message: 'Non authentifié' } }
    const payload = {
      user_id: user.id,
      user_email: user.email,
      type,
      message,
      created_at: new Date().toISOString()
    }
    if (isLocalMode) {
      const all = localDB.read('feedback', [])
      localDB.write('feedback', [{ id: localDB.uid(), ...payload }, ...all])
      await fetchItems()
      return { error: null }
    }
    const { error } = await supabase.from('feedback').insert(payload)
    if (!error) await fetchItems()
    return { error }
  }, [user, fetchItems])

  return { items, loading, addFeedback }
}

// Gère la table `support_requests` (contact / support), pour les problèmes
// client ou techniques à faire remonter à l'équipe.
export function useSupportRequests() {
  const { user } = useAuth()

  const addRequest = useCallback(async ({ subject, message }) => {
    if (!user) return { error: { message: 'Non authentifié' } }
    const payload = {
      user_id: user.id,
      user_email: user.email,
      subject,
      message,
      status: 'open',
      created_at: new Date().toISOString()
    }
    if (isLocalMode) {
      const all = localDB.read('support_requests', [])
      localDB.write('support_requests', [{ id: localDB.uid(), ...payload }, ...all])
      return { error: null }
    }
    const { error } = await supabase.from('support_requests').insert(payload)
    return { error }
  }, [user])

  return { addRequest }
}
