import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isLocalMode, localDB, seedLocalDataIfEmpty } from '../lib/localMode'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfileRemote = useCallback(async (userId) => {
    if (!userId) return setProfile(null)
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (!error) setProfile(data)
  }, [])

  useEffect(() => {
    if (isLocalMode) {
      const existing = localDB.read('session', null)
      if (existing) {
        setSession(existing)
        setProfile(localDB.read('profile', null))
        seedLocalDataIfEmpty()
      }
      setLoading(false)
      return
    }

    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setSession(session)
      if (session?.user?.id) fetchProfileRemote(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.id) fetchProfileRemote(session.user.id)
      else setProfile(null)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfileRemote])

  const signUp = useCallback(async ({ email, password, fullName }) => {
    if (isLocalMode) {
      const user = { id: localDB.uid(), email }
      const newSession = { user }
      const newProfile = { id: user.id, email, full_name: fullName, avatar_url: null, currency: 'EUR' }
      localDB.write('session', newSession)
      localDB.write('profile', newProfile)
      setSession(newSession)
      setProfile(newProfile)
      seedLocalDataIfEmpty()
      return { data: { user }, error: null }
    }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } })
    return { data, error }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    if (isLocalMode) {
      const existingProfile = localDB.read('profile', null)
      const user = existingProfile?.email === email
        ? { id: existingProfile.id, email }
        : { id: localDB.uid(), email }
      const newSession = { user }
      const newProfile = existingProfile?.email === email
        ? existingProfile
        : { id: user.id, email, full_name: email.split('@')[0], avatar_url: null, currency: 'EUR' }
      localDB.write('session', newSession)
      localDB.write('profile', newProfile)
      setSession(newSession)
      setProfile(newProfile)
      seedLocalDataIfEmpty()
      return { data: { user }, error: null }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (isLocalMode) {
      return signIn({ email: 'demo@foliomeca.local', password: '' })
    }
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
    return { data, error }
  }, [signIn])

  const signOut = useCallback(async () => {
    if (isLocalMode) {
      localStorage.removeItem('foliomeca_local_session')
      setSession(null)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
  }, [])

  const refreshProfile = useCallback(() => {
    if (isLocalMode) {
      setProfile(localDB.read('profile', null))
      return
    }
    if (session?.user?.id) fetchProfileRemote(session.user.id)
  }, [session, fetchProfileRemote])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    isLocalMode,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}
