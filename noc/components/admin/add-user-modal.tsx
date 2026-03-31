'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface AddUserModalProps {
  onClose: () => void
  onUserAdded: () => void
}

export default function AddUserModal({ onClose, onUserAdded }: AddUserModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('REGISTRAR')
  const [loading, setLoading] = useState(false)

  const roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'REGISTRAR', label: 'Registrar' },
    { value: 'JOINT_REGISTRAR', label: 'Joint Registrar' },
    { value: 'ESTABLISHMENT_1', label: 'Establishment (Faculty)' },
    { value: 'ESTABLISHMENT_2', label: 'Establishment (Staff)' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !role) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to create user')
        return
      }

      toast.success('User created successfully')
      onUserAdded()
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-white/10 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add New User</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm font-medium block mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="text-sm font-medium block mb-2">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-black/10 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-full bg-foreground text-background font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
