import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isLocalMode, localDB } from '../lib/localMode'
import { useAuth } from '../context/AuthContext'

export function useReminders(vehicleId = null) {
  const { user } = useAuth()
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReminders = useCallback(async () => {
    if (!user) {
      setReminders([])
      setLoading(false)
      return
    }
    setLoading(true)

    if (isLocalMode) {
      const allReminders = localDB.read('reminders', [])
      const allVehicles = localDB.read('vehicles', [])
      const myVehicleIds = new Set(allVehicles.filter((v) => v.user_id === user.id).map((v) => v.id))
      let mine = allReminders
        .filter((r) => myVehicleIds.has(r.vehicle_id))
        .map((r) => ({ ...r, vehicles: allVehicles.find((v) => v.id === r.vehicle_id) }))
      if (vehicleId) mine = mine.filter((r) => r.vehicle_id === vehicleId)
      mine.sort((a, b) => {
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        return new Date(a.due_date) - new Date(b.due_date)
      })
      setReminders(mine)
      setLoading(false)
      return
    }

    let query = supabase
      .from('reminders')
      .select('*, vehicles!inner(id, make, model, type, user_id, current_mileage)')
      .eq('vehicles.user_id', user.id)
      .order('due_date', { ascending: true, nullsFirst: false })
    if (vehicleId) query = query.eq('vehicle_id', vehicleId)

    const { data, error } = await query
    if (error) setError(error)
    else setReminders(data || [])
    setLoading(false)
  }, [user, vehicleId])

  useEffect(() => {
    fetchReminders()
  }, [fetchReminders])

  const addReminder = useCallback(async (reminder) => {
    if (isLocalMode) {
      const all = localDB.read('reminders', [])
      const newReminder = { id: localDB.uid(), ...reminder }
      localDB.write('reminders', [newReminder, ...all])
      await fetchReminders()
      return { data: newReminder, error: null }
    }
    const { data, error } = await supabase.from('reminders').insert([reminder]).select().single()
    if (!error) await fetchReminders()
    return { data, error }
  }, [fetchReminders])

  const updateReminder = useCallback(async (id, updates) => {
    if (isLocalMode) {
      const all = localDB.read('reminders', [])
      localDB.write('reminders', all.map((r) => (r.id === id ? { ...r, ...updates } : r)))
      await fetchReminders()
      return { error: null }
    }
    const { error } = await supabase.from('reminders').update(updates).eq('id', id)
    if (!error) await fetchReminders()
    return { error }
  }, [fetchReminders])

  const toggleReminder = useCallback(async (id, is_completed) => {
    if (isLocalMode) {
      const all = localDB.read('reminders', [])
      localDB.write('reminders', all.map((r) => (r.id === id ? { ...r, is_completed } : r)))
      await fetchReminders()
      return { error: null }
    }
    const { error } = await supabase.from('reminders').update({ is_completed }).eq('id', id)
    if (!error) await fetchReminders()
    return { error }
  }, [fetchReminders])

  const deleteReminder = useCallback(async (id) => {
    if (isLocalMode) {
      const all = localDB.read('reminders', [])
      localDB.write('reminders', all.filter((r) => r.id !== id))
      await fetchReminders()
      return { error: null }
    }
    const { error } = await supabase.from('reminders').delete().eq('id', id)
    if (!error) await fetchReminders()
    return { error }
  }, [fetchReminders])

  return { reminders, loading, error, addReminder, updateReminder, toggleReminder, deleteReminder, refetch: fetchReminders }
}
