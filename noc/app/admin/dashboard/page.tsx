'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import UserManagement from '@/components/admin/user-management'
import { Loader } from 'lucide-react'

export default function AdminDashboard() {
  const { user, loading, hasRole } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      const authorized = user && (user.role === 'ADMIN' || user.role === 'REGISTRAR')
      setIsAuthorized(authorized)
      
      if (!authorized && user) {
        toast.error('Unauthorized access')
      }
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-secondary font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p className="text-secondary font-medium">You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Admin Dashboard</h1>
        <p className="text-secondary font-medium">Manage users and system settings</p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {user?.role === 'ADMIN' && <UserManagement />}
      </div>
    </div>
  )
}
