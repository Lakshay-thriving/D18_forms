'use client'

import { useAuth } from '@/hooks/useAuth'
import NOCForm from '@/components/applicant/noc-form'
import { Loader, Printer, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NOCRequest {
  id: string
  requestId: string
  status: string
  purpose: string
  certificateType: string
  createdAt: string
  submittedAt: string | null
  currentStage: string | null
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
  draft: number
}

export default function ApplicantDashboard() {
  const { user, loading } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, draft: 0 })
  const [requests, setRequests] = useState<NOCRequest[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetch('/api/noc/my-requests')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRequests(data.requests)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (!loading && user) {
      fetchData()
    }
  }, [loading, user])

  const handleFormSuccess = () => {
    setShowForm(false)
    fetchData() // Refresh data after submission
  }

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-secondary font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">NOC Request Portal</h1>
        <p className="text-secondary font-medium">Apply for No Objection Certificates, Residence Proof, or other certificates</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-black/10 dark:border-white/10 rounded-lg p-4">
          <p className="text-xs text-black/50 dark:text-white/50 mb-1 font-medium font-mono">Total Applications</p>
          <p className="text-2xl font-semibold font-mono">{stats.total}</p>
        </div>
        <div className="border border-black/10 dark:border-white/10 rounded-lg p-4">
          <p className="text-xs text-black/50 dark:text-white/50 mb-1 font-medium font-mono">Pending Approval</p>
          <p className="text-2xl font-semibold font-mono">{stats.pending}</p>
        </div>
        <div className="border border-black/10 dark:border-white/10 rounded-lg p-4">
          <p className="text-xs text-black/50 dark:text-white/50 mb-1 font-medium font-mono">Approved</p>
          <p className="text-2xl font-semibold font-mono">{stats.approved}</p>
        </div>
        <div className="border border-black/10 dark:border-white/10 rounded-lg p-4">
          <p className="text-xs text-black/50 dark:text-white/50 mb-1 font-medium font-mono">Draft</p>
          <p className="text-2xl font-semibold font-mono text-black/40 dark:text-white/40">{stats.draft}</p>
        </div>
      </div>

      {/* Main Content */}
      {!showForm ? (
        <div className="border border-black/10 dark:border-white/10 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">New NOC Request</h2>
            <p className="text-secondary mb-6 font-medium">
              Fill out the form to submit a new request for a No Objection Certificate or other institutional certificate.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-all"
            >
              Start New Request
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-black/10 dark:border-white/10 rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">New NOC Request</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-secondary hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </div>
          <NOCForm onSuccess={handleFormSuccess} />
        </div>
      )}

      {/* Recent Requests */}
      {requests.length > 0 && !showForm && (
        <div className="mt-8 border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-black/10 dark:border-white/10">
            <h2 className="text-lg font-semibold">Your Applications</h2>
          </div>
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {requests.map((request) => (
              <div key={request.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{request.requestId}</p>
                  <p className="text-sm text-secondary">{request.purpose.substring(0, 50)}...</p>
                  <p className="text-xs text-secondary mt-1">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium font-mono border ${
                      request.status === 'APPROVED' || request.status === 'COMPLETED'
                        ? 'bg-black dark:bg-white text-white dark:text-black border-transparent'
                        : request.status === 'REJECTED'
                        ? 'bg-black/10 dark:bg-white/10 text-black/70 dark:text-white/70 border-black/20 dark:border-white/20 line-through'
                        : request.status === 'DRAFT'
                        ? 'bg-transparent text-black/40 dark:text-white/40 border-black/10 dark:border-white/10'
                        : 'bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 border-black/10 dark:border-white/10'
                    }`}>
                      {request.status.replace(/_/g, ' ')}
                    </span>
                    {request.currentStage && (
                      <p className="text-xs text-secondary mt-1">
                        {request.currentStage.replace(/_/g, ' ')}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/noc/print?id=${request.requestId}`}
                    className="flex items-center gap-1 px-4 py-2 text-sm border border-black/10 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
