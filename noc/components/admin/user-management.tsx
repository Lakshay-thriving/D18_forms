'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, X, Trash2, Plus } from 'lucide-react'
import AddUserModal from './add-user-modal'

interface User {
  id: string
  email: string
  role: string
  isApproved: boolean
  createdAt: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleApprove = async (userId: string) => {
    try {
      setUpdatingId(userId)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve user')
      }

      toast.success('User approved')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to approve user')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleReject = async (userId: string) => {
    try {
      setUpdatingId(userId)
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to reject user')
      }

      toast.success('User removed')
      fetchUsers()
    } catch (error) {
      toast.error('Failed to remove user')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleAddUser = async () => {
    fetchUsers()
    setShowAddModal(false)
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-foreground/10 text-foreground',
    REGISTRAR: 'bg-black/5 dark:bg-white/5',
    JOINT_REGISTRAR: 'bg-black/5 dark:bg-white/5',
    ESTABLISHMENT_1: 'bg-black/5 dark:bg-white/5',
    ESTABLISHMENT_2: 'bg-black/5 dark:bg-white/5',
    APPLICANT: 'bg-black/5 dark:bg-white/5',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-secondary mt-1 font-medium">{users.length} users total</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onUserAdded={handleAddUser}
        />
      )}

      {/* Users Table */}
      <div className="overflow-x-auto border border-black/10 dark:border-white/10 rounded-lg">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-foreground border-t-background rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-secondary text-sm font-medium">Loading users...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <p className="text-secondary font-medium">No users found</p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-black/10 dark:border-white/10 bg-black/2 dark:bg-white/2">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-black/5 dark:border-white/5 hover:bg-black/2 dark:hover:bg-white/2 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      user.isApproved
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 border border-black/10 dark:border-white/10'
                    }`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-secondary font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!user.isApproved && (
                        <button
                          onClick={() => handleApprove(user.id)}
                          disabled={updatingId === user.id}
                          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
                          title="Approve user"
                        >
                          <Check className="w-4 h-4 text-black dark:text-white" />
                        </button>
                      )}
                      <button
                        onClick={() => handleReject(user.id)}
                        disabled={updatingId === user.id}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
                        title="Remove user"
                      >
                        <Trash2 className="w-4 h-4 text-black/50 dark:text-white/50" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
