import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isLocalMode, localDB } from '../lib/localMode'

const BUCKET_DOCUMENTS = 'documents'

export function useDocuments(vehicleId) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDocuments = useCallback(async () => {
    if (!vehicleId) {
      setDocuments([])
      setLoading(false)
      return
    }
    setLoading(true)

    if (isLocalMode) {
      const all = localDB.read('vehicle_documents', [])
      const mine = all
        .filter((d) => d.vehicle_id === vehicleId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setDocuments(mine)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('vehicle_documents')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })

    if (error) setError(error)
    else setDocuments(data || [])
    setLoading(false)
  }, [vehicleId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const addDocument = useCallback(async (file, label) => {
    if (!file) return { error: new Error('Aucun fichier sélectionné') }

    if (isLocalMode) {
      const file_url = await localDB.fileToDataUrl(file)
      const all = localDB.read('vehicle_documents', [])
      const newDoc = {
        id: localDB.uid(),
        vehicle_id: vehicleId,
        name: label || file.name,
        mime_type: file.type,
        file_url,
        created_at: new Date().toISOString()
      }
      localDB.write('vehicle_documents', [newDoc, ...all])
      await fetchDocuments()
      return { data: newDoc, error: null }
    }

    const ext = file.name.split('.').pop()
    const path = `${vehicleId}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage.from(BUCKET_DOCUMENTS).upload(path, file, { upsert: true })
    if (uploadError) return { error: uploadError }
    const { data: signedUrl } = await supabase.storage.from(BUCKET_DOCUMENTS).createSignedUrl(path, 60 * 60 * 24 * 365)

    const { data, error } = await supabase
      .from('vehicle_documents')
      .insert([{ vehicle_id: vehicleId, name: label || file.name, mime_type: file.type, file_url: signedUrl?.signedUrl ?? path }])
      .select()
      .single()

    if (!error) await fetchDocuments()
    return { data, error }
  }, [vehicleId, fetchDocuments])

  const deleteDocument = useCallback(async (id) => {
    if (isLocalMode) {
      const all = localDB.read('vehicle_documents', [])
      localDB.write('vehicle_documents', all.filter((d) => d.id !== id))
      await fetchDocuments()
      return { error: null }
    }
    const { error } = await supabase.from('vehicle_documents').delete().eq('id', id)
    if (!error) await fetchDocuments()
    return { error }
  }, [fetchDocuments])

  return { documents, loading, error, addDocument, deleteDocument, refetch: fetchDocuments }
}
