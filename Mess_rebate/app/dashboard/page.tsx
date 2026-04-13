import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-tracker'
import { getCurrentSemester } from '@/lib/validations'
import { REBATE_RULES } from '@/lib/types'
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import type { RequestStatus } from '@/lib/types'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Get dashboard stats based on role
  let stats = {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  }

  let recentRequests: {
    id: string
    status: RequestStatus
    fromDate: Date
    toDate: Date
    totalDays: number
    createdAt: Date
    student?: { name: string; entryNumber: string | null }
  }[] = []

  let remainingDays = REBATE_RULES.MAX_DAYS_PER_SEMESTER

  if (user.role === 'STUDENT') {
    const requests = await prisma.rebateRequest.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    recentRequests = requests.map(r => ({
      ...r,
      status: r.status as RequestStatus,
    }))

    stats = {
      total: requests.length,
      pending: requests.filter((r) => 
        !['COMPLETED', 'JS_APPROVED', 'JS_REJECTED', 'MESS_MANAGER_REJECTED', 'CARETAKER_REJECTED'].includes(r.status)
      ).length,
      approved: requests.filter((r) => ['COMPLETED', 'JS_APPROVED'].includes(r.status)).length,
      rejected: requests.filter((r) => 
        ['JS_REJECTED', 'MESS_MANAGER_REJECTED', 'CARETAKER_REJECTED'].includes(r.status)
      ).length,
    }

    // Get remaining days
    const currentSemester = getCurrentSemester()
    const tracker = await prisma.semesterRebateTracker.findUnique({
      where: {
        studentId_semester: {
          studentId: user.id,
          semester: currentSemester,
        },
      },
    })
    remainingDays = REBATE_RULES.MAX_DAYS_PER_SEMESTER - (tracker?.totalDaysUsed || 0)
  } else {
    // Staff dashboard
    let statusFilter: RequestStatus[] = []

    if (user.role === 'MESS_MANAGER') {
      statusFilter = ['SUBMITTED']
    } else if (user.role === 'CARETAKER') {
      statusFilter = ['SUBMITTED', 'MESS_MANAGER_APPROVED']
    } else if (user.role === 'JUNIOR_SUPERINTENDENT') {
      statusFilter = ['CARETAKER_APPROVED']
    }

    const pendingRequests = await prisma.rebateRequest.findMany({
      where: statusFilter.length > 0 ? { status: { in: statusFilter } } : {},
      include: {
        student: {
          select: { name: true, entryNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    recentRequests = pendingRequests.map(r => ({
      ...r,
      status: r.status as RequestStatus,
    }))

    const allRequests = await prisma.rebateRequest.findMany()
    stats = {
      total: allRequests.length,
      pending: pendingRequests.length,
      approved: allRequests.filter((r) => ['COMPLETED', 'JS_APPROVED'].includes(r.status)).length,
      rejected: allRequests.filter((r) => 
        ['JS_REJECTED', 'MESS_MANAGER_REJECTED', 'CARETAKER_REJECTED'].includes(r.status)
      ).length,
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name}
            </p>
          </div>
          {user.role === 'STUDENT' && (
            <Button asChild>
              <Link href="/rebate/new">
                <Plus className="mr-2 h-4 w-4" />
                New Rebate Request
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Requests
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rejected
              </CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Student-specific: Remaining Days */}
        {user.role === 'STUDENT' && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Semester Rebate Allowance</CardTitle>
              <CardDescription>Your remaining rebate days for this semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>Used: {REBATE_RULES.MAX_DAYS_PER_SEMESTER - remainingDays} days</span>
                    <span>Remaining: {remainingDays} days</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${((REBATE_RULES.MAX_DAYS_PER_SEMESTER - remainingDays) / REBATE_RULES.MAX_DAYS_PER_SEMESTER) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">{remainingDays}</span>
                  <span className="text-muted-foreground">/{REBATE_RULES.MAX_DAYS_PER_SEMESTER}</span>
                </div>
              </div>
              {remainingDays < 5 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-warning-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span>You have limited rebate days remaining this semester.</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {user.role === 'STUDENT' ? 'Recent Requests' : 'Pending Approvals'}
            </CardTitle>
            <CardDescription>
              {user.role === 'STUDENT'
                ? 'Your recent rebate requests'
                : 'Requests awaiting your action'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 h-8 w-8" />
                <p>No requests found</p>
                {user.role === 'STUDENT' && (
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/rebate/new">Create your first request</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <Link
                    key={request.id}
                    href={user.role === 'STUDENT' ? `/rebate/${request.id}` : `/approvals/${request.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        {request.student && (
                          <p className="font-medium">{request.student.name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.fromDate).toLocaleDateString()} -{' '}
                          {new Date(request.toDate).toLocaleDateString()} ({request.totalDays} days)
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {recentRequests.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href={user.role === 'STUDENT' ? '/rebate/history' : '/approvals'}>
                    View All
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Important Instructions for Students */}
        {user.role === 'STUDENT' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Important Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-medium text-accent">{"Do's"}</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>Apply at least one day in advance</li>
                    <li>Submit Mess ID card during rebate period</li>
                    <li>Use correct rebate type</li>
                    <li>Keep acknowledgment receipt</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-destructive">{"Don'ts"}</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>No backdated applications</li>
                    <li>No proxy submission</li>
                    <li>No rebate for less than 3 days</li>
                    <li>No exceeding 20 days without approval</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
