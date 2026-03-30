import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const register = async (email, password) => {
    return await supabase.auth.signUp({ email, password })
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return { user, loading, login, register, logout }
}
