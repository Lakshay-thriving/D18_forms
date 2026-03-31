'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  role: 'APPLICANT' | 'REGISTRAR' | 'JOINT_REGISTRAR' | 'ESTABLISHMENT_1' | 'ESTABLISHMENT_2' | 'ADMIN'
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        
        if (response.status === 401) {
          setUser(null)
          setLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch session')
        }

        const data = await response.json()
        setUser(data.session)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/auth/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed')
    }
  }

  const hasRole = (role: string | string[]) => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  return {
    user,
    loading,
    error,
    logout,
    hasRole,
    isAuthenticated: !!user,
  }
}
