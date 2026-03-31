'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Plus, LogOut, FileText, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface Application {
  id: string
  status: string
  applicantName: string
  department: string
  emailId: string
  createdAt: string
  hostelRentCategory: string
  allocatedHostel: string | null
}

export default function ApplicantDashboard() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUserData()
    fetchApplications()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/auth')
        return
      }
      const data = await response.json()
      setUserName(data.user.name)
    } catch {
      setError('Failed to load user data')
    }
  }

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/applications')
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth')
        } else {
          setError('Failed to load applications')
        }
        return
      }
      const data = await response.json()
      setApplications(data.applications || [])
    } catch {
      setError('Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch {
      setError('Failed to logout')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      SUBMITTED: { color: 'bg-blue-100 text-blue-800', icon: <FileText className="w-4 h-4" /> },
      PENDING_FACULTY_APPROVAL: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      PENDING_HOD_RECOMMENDATION: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      PENDING_HOSTEL_REVIEW: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      PENDING_ALLOCATION: { color: 'bg-purple-100 text-purple-800', icon: <Clock className="w-4 h-4" /> },
      PENDING_AR_APPROVAL: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      PENDING_CHIEF_WARDEN_APPROVAL: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      SENT_BACK_TO_APPLICANT: { color: 'bg-orange-100 text-orange-800', icon: <FileText className="w-4 h-4" /> },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: <FileText className="w-4 h-4" /> },
    }

    const statusConfig = statusMap[status] || { color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-4 h-4" /> }
    const statusLabel = status.replace(/_/g, ' ')

    return (
      <div className="flex items-center gap-2">
        {statusConfig.icon}
        <Badge className={statusConfig.color}>{statusLabel}</Badge>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="font-bold text-lg">IIT Ropar</h1>
                <p className="text-xs text-muted-foreground">
                  Hostel Allocation System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">Applicant</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* New Application Card */}
        <Card className="mb-8 border-2 border-primary">
          <CardHeader>
            <CardTitle>Create New Application</CardTitle>
            <CardDescription>
              Start your hostel allocation application process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/apply">
              <Button size="lg" className="w-full">
                <Plus className="mr-2 h-5 w-5" />
                Start New Application
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Applications</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-2">Loading your applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">You haven&apos;t submitted any applications yet.</p>
                <Link href="/apply" className="mt-4 inline-block">
                  <Button>Submit Your First Application</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {applications.map((app) => (
                <Card key={app.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{app.applicantName}</CardTitle>
                        <CardDescription>
                          {app.department} • Category: {app.hostelRentCategory}
                        </CardDescription>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{app.emailId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Application ID</p>
                        <p className="font-mono text-xs">{app.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="font-medium">{new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      {app.allocatedHostel && (
                        <div>
                          <p className="text-muted-foreground">Allocated Hostel</p>
                          <p className="font-medium text-green-600">{app.allocatedHostel}</p>
                        </div>
                      )}
                    </div>
                    <Link href={`/application/${app.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details & Status
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
