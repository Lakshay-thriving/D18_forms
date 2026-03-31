import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-tracker'
import { Calendar, User, ArrowRight, FileText } from 'lucide-react'
import type { RequestStatus } from '@/lib/types'

export default async function ApprovalsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'STUDENT') {
    redirect('/dashboard')
  }

  let statusFilter: RequestStatus[] = []
  let pageTitle = 'All Requests'
  let pageDescription = 'View and manage all rebate requests'

  if (user.role === 'MESS_MANAGER') {
    statusFilter = ['SUBMITTED']
    pageTitle = 'Pending Meal Verification'
    pageDescription = 'Verify meal counts and dates for submitted requests'
  } else if (user.role === 'CARETAKER') {
    statusFilter = ['SUBMITTED', 'MESS_MANAGER_APPROVED']
    pageTitle = 'Pending Verification'
    pageDescription = 'Verify student details and forward approved requests'
  } else if (user.role === 'JUNIOR_SUPERINTENDENT') {
    statusFilter = ['CARETAKER_APPROVED']
    pageTitle = 'Pending Final Approval'
    pageDescription = 'Review and provide final approval for rebate requests'
  }

  const requests = await prisma.rebateRequest.findMany({
    where: statusFilter.length > 0 ? { status: { in: statusFilter } } : {},
    include: {
      student: {
        select: { name: true, entryNumber: true, hostelName: true, messName: true },
      },
      approvals: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
          <p className="text-muted-foreground">{pageDescription}</p>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No pending requests</h3>
              <p className="text-center text-muted-foreground">
                There are no requests awaiting your action.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Link key={request.id} href={`/approvals/${request.id}`}>
                <Card className="transition-all hover:shadow-md hover:border-primary/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <User className="h-4 w-4" />
                          {request.student.name}
                        </CardTitle>
                        <CardDescription>
                          {request.student.entryNumber} | {request.student.hostelName}
                        </CardDescription>
                      </div>
                      <StatusBadge status={request.status as RequestStatus} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(request.fromDate).toLocaleDateString()} -{' '}
                          {new Date(request.toDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{request.totalDays}</span>
                        <span className="text-muted-foreground">days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{request.totalMeals}</span>
                        <span className="text-muted-foreground">meals</span>
                      </div>
                      <div className="flex items-center gap-2 rounded bg-secondary px-2 py-0.5">
                        <span className="text-xs">
                          {request.rebateType === 'PERSONAL_LEAVE' ? 'Personal' : 'Official'}
                        </span>
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-primary">
                        <span>Review</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Show approval progress */}
                    {request.approvals.length > 0 && (
                      <div className="mt-3 border-t pt-3">
                        <div className="flex flex-wrap gap-2">
                          {request.approvals.map((approval) => (
                            <span
                              key={approval.id}
                              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs ${
                                approval.approved
                                  ? 'bg-accent/10 text-accent'
                                  : 'bg-destructive/10 text-destructive'
                              }`}
                            >
                              {approval.approverRole.replace('_', ' ')}:{' '}
                              {approval.approved ? 'Approved' : 'Rejected'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
