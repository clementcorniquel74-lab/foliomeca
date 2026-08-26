import { useCallback, useEffect, useState } from 'react'
import { supabase, BUCKETS } from '../lib/supabaseClient'
import { isLocalMode, localDB } from '../lib/localMode'

export function useMaintenance(vehicleId) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRecords = useCallback(async () => {
    if (!vehicleId) {
      setRecords([])
      setLoading(false)
      return
    }
    setLoading(true)

    if (isLocalMode) {
      const all = localDB.read('maintenance_records', [])
      const mine = all
        .filter((r) => r.vehicle_id === vehicleId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      setRecords(mine)
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('date', { ascending: false })

    if (error) setError(error)
    else setRecords(data || [])
    setLoading(false)
  }, [vehicleId])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const addRecord = useCallback(async (record, invoiceFile) => {
    if (isLocalMode) {
      let invoice_url = null
      if (invoiceFile) invoice_url = await localDB.fileToDataUrl(invoiceFile)
      const all = localDB.read('maintenance_records', [])
      const newRecord = { id: localDB.uid(), vehicle_id: vehicleId, ...record, invoice_url, created_at: new Date().toISOString() }
      localDB.write('maintenance_records', [newRecord, ...all])
      await fetchRecords()
      return { data: newRecord, error: null }
    }

    let invoice_url = null
    if (invoiceFile) {
      const ext = invoiceFile.name.split('.').pop()
      const path = `${vehicleId}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from(BUCKETS.INVOICES).upload(path, invoiceFile, { upsert: true })
      if (uploadError) return { error: uploadError }
      const { data: signedUrl } = await supabase.storage.from(BUCKETS.INVOICES).createSignedUrl(path, 60 * 60 * 24 * 365)
      invoice_url = signedUrl?.signedUrl ?? path
    }

    const { data, error } = await supabase.from('maintenance_records').insert([{ ...record, vehicle_id: vehicleId, invoice_url }]).select().single()
    if (!error) await fetchRecords()
    return { data, error }
  }, [vehicleId, fetchRecords])

  const updateRecord = useCallback(async (recordId, updates, invoiceFile) => {
    if (isLocalMode) {
      let invoice_url = updates.invoice_url
      if (invoiceFile) invoice_url = await localDB.fileToDataUrl(invoiceFile)
      const all = localDB.read('maintenance_records', [])
      localDB.write('maintenance_records', all.map((r) => (r.id === recordId ? { ...r, ...updates, invoice_url } : r)))
      await fetchRecords()
      return { error: null }
    }

    let invoice_url = updates.invoice_url
    if (invoiceFile) {
      const ext = invoiceFile.name.split('.').pop()
      const path = `${vehicleId}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from(BUCKETS.INVOICES).upload(path, invoiceFile, { upsert: true })
      if (uploadError) return { error: uploadError }
      const { data: signedUrl } = await supabase.storage.from(BUCKETS.INVOICES).createSignedUrl(path, 60 * 60 * 24 * 365)
      invoice_url = signedUrl?.signedUrl ?? path
    }

    const { error } = await supabase.from('maintenance_records').update({ ...updates, invoice_url }).eq('id', recordId)
    if (!error) await fetchRecords()
    return { error }
  }, [vehicleId, fetchRecords])

  const deleteRecord = useCallback(async (recordId) => {
    if (isLocalMode) {
      const all = localDB.read('maintenance_records', [])
      localDB.write('maintenance_records', all.filter((r) => r.id !== recordId))
      await fetchRecords()
      return { error: null }
    }
    const { error } = await supabase.from('maintenance_records').delete().eq('id', recordId)
    if (!error) await fetchRecords()
    return { error }
  }, [fetchRecords])

  return { records, loading, error, addRecord, updateRecord, deleteRecord, refetch: fetchRecords }
}
