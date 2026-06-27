import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let cancelled = false

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!cancelled) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error al obtener sesión:', err)
        if (!cancelled) {
          setUser(null)
          setLoading(false)
        }
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase no está configurado')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email, password, name) => {
    if (!supabase) throw new Error('Supabase no está configurado')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (!supabase) throw new Error('Supabase no está configurado')
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updatePassword = async (newPassword) => {
    if (!supabase) throw new Error('Supabase no está configurado')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
