'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on role
      if (user.role === 'APPLICANT') {
        router.push('/applicant/dashboard')
      } else if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        // Other roles (REGISTRAR, JOINT_REGISTRAR, ESTABLISHMENT_*)
        router.push('/workflow/dashboard')
      }
    } else if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground border-t-background rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}
