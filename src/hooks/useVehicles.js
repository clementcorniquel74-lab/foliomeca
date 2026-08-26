import { useCallback, useEffect, useState } from 'react'
import { supabase, BUCKETS } from '../lib/supabaseClient'
import { isLocalMode, localDB } from '../lib/localMode'
import { useAuth } from '../context/AuthContext'

function withStats(vehicles, records, reminders) {
  return vehicles.map((v) => {
    const vRecords = records.filter((r) => r.vehicle_id === v.id)
    const vReminders = reminders.filter((r) => r.vehicle_id === v.id)
    return {
      ...v,
      total_cost: vRecords.reduce((s, r) => s + (Number(r.cost) || 0), 0),
      pending_reminders: vReminders.filter((r) => !r.is_completed)
    }
  })
}

export function useVehicles() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchVehicles = useCallback(async () => {
    if (!user) {
      setVehicles([])
      setLoading(false)
      return
    }
    setLoading(true)

    if (isLocalMode) {
      const all = localDB.read('vehicles', [])
      const records = localDB.read('maintenance_records', [])
      const reminders = localDB.read('reminders', [])
      const mine = all.filter((v) => v.user_id === user.id)
      setVehicles(withStats(mine, records, reminders))
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select('*, maintenance_records(cost), reminders(id, title, due_date, due_mileage, is_completed)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error)
    } else {
      const stats = (data || []).map((v) => ({
        ...v,
        total_cost: (v.maintenance_records || []).reduce((s, r) => s + (Number(r.cost) || 0), 0),
        pending_reminders: (v.reminders || []).filter((r) => !r.is_completed)
      }))
      setVehicles(stats)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const addVehicle = useCallback(async (vehicle, imageFile) => {
    if (!user) return { error: new Error('Non authentifié') }

    if (isLocalMode) {
      let image_url = null
      if (imageFile) image_url = await localDB.fileToDataUrl(imageFile)
      const all = localDB.read('vehicles', [])
      const newVehicle = { id: localDB.uid(), user_id: user.id, ...vehicle, image_url, created_at: new Date().toISOString() }
      localDB.write('vehicles', [newVehicle, ...all])
      await fetchVehicles()
      return { data: newVehicle, error: null }
    }

    let image_url = null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from(BUCKETS.VEHICLE_PHOTOS).upload(path, imageFile, { upsert: true })
      if (uploadError) return { error: uploadError }
      const { data: publicUrl } = supabase.storage.from(BUCKETS.VEHICLE_PHOTOS).getPublicUrl(path)
      image_url = publicUrl.publicUrl
    }

    const { data, error } = await supabase.from('vehicles').insert([{ ...vehicle, user_id: user.id, image_url }]).select().single()
    if (!error) await fetchVehicles()
    return { data, error }
  }, [user, fetchVehicles])

  const updateVehicle = useCallback(async (vehicleId, updates, imageFile) => {
    if (isLocalMode) {
      let image_url = updates.image_url
      if (imageFile) image_url = await localDB.fileToDataUrl(imageFile)
      const all = localDB.read('vehicles', [])
      localDB.write('vehicles', all.map((v) => (v.id === vehicleId ? { ...v, ...updates, image_url } : v)))
      await fetchVehicles()
      return { error: null }
    }

    let image_url = updates.image_url
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage.from(BUCKETS.VEHICLE_PHOTOS).upload(path, imageFile, { upsert: true })
      if (uploadError) return { error: uploadError }
      const { data: publicUrl } = supabase.storage.from(BUCKETS.VEHICLE_PHOTOS).getPublicUrl(path)
      image_url = publicUrl.publicUrl
    }

    const { error } = await supabase.from('vehicles').update({ ...updates, image_url }).eq('id', vehicleId)
    if (!error) await fetchVehicles()
    return { error }
  }, [user, fetchVehicles])

  const updateVehicleMileage = useCallback(async (vehicleId, mileage) => {
    if (isLocalMode) {
      const all = localDB.read('vehicles', [])
      localDB.write('vehicles', all.map((v) => (v.id === vehicleId ? { ...v, current_mileage: mileage } : v)))
      await fetchVehicles()
      return { error: null }
    }
    const { error } = await supabase.from('vehicles').update({ current_mileage: mileage }).eq('id', vehicleId)
    if (!error) await fetchVehicles()
    return { error }
  }, [fetchVehicles])

  const deleteVehicle = useCallback(async (vehicleId) => {
    if (isLocalMode) {
      const all = localDB.read('vehicles', [])
      localDB.write('vehicles', all.filter((v) => v.id !== vehicleId))
      const records = localDB.read('maintenance_records', [])
      localDB.write('maintenance_records', records.filter((r) => r.vehicle_id !== vehicleId))
      const reminders = localDB.read('reminders', [])
      localDB.write('reminders', reminders.filter((r) => r.vehicle_id !== vehicleId))
      await fetchVehicles()
      return { error: null }
    }
    const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId)
    if (!error) await fetchVehicles()
    return { error }
  }, [fetchVehicles])

  return { vehicles, loading, error, addVehicle, updateVehicle, updateVehicleMileage, deleteVehicle, refetch: fetchVehicles }
}
