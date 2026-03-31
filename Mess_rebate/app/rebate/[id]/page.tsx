import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusTracker, StatusBadge } from '@/components/status-tracker'
import { ArrowLeft, Calendar, Utensils, FileText, User, Home, Building } from 'lucide-react'
import type { RequestStatus } from '@/lib/types'

export default async function RebateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const request = await prisma.rebateRequest.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          name: true,
          entryNumber: true,
          course: true,
          hostelName: true,
          roomNumber: true,
          messName: true,
        },
      },
      approvals: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!request) {
    notFound()
  }

  // Students can only view their own requests
  if (user.role === 'STUDENT' && request.studentId !== user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/rebate/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Link>
          </Button>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rebate Request Details</h1>
            <p className="text-muted-foreground">
              Request ID: {request.id.slice(0, 8)}...
            </p>
          </div>
          <StatusBadge status={request.status as RequestStatus} />
        </div>

        {/* Status Tracker */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Request Status</CardTitle>
            <CardDescription>Track your request through the approval workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusTracker status={request.status as RequestStatus} />
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Student Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Student Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{request.student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry Number</span>
                <span className="font-medium">{request.student.entryNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Course</span>
                <span className="font-medium">{request.student.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hostel</span>
                <span className="font-medium">{request.student.hostelName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room</span>
                <span className="font-medium">{request.student.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mess</span>
                <span className="font-medium">{request.student.messName}</span>
              </div>
            </CardContent>
          </Card>

          {/* Rebate Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Rebate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">
                  {request.rebateType === 'PERSONAL_LEAVE' 
                    ? 'Personal Leave' 
                    : 'Official/Duty Leave'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">From</span>
                <span className="font-medium">
                  {new Date(request.fromDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span className="font-medium">
                  {new Date(request.toDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Days</span>
                  <span className="text-lg font-bold">{request.totalDays}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Meals</span>
                  <span className="text-lg font-bold">{request.totalMeals}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approval History */}
        {request.approvals.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Approval History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.approvals.map((approval) => (
                  <div
                    key={approval.id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div
                      className={`mt-1 h-3 w-3 rounded-full ${
                        approval.approved ? 'bg-accent' : 'bg-destructive'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {approval.approverRole.replace('_', ' ')}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {new Date(approval.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {approval.approved ? 'Approved' : 'Rejected'}
                      </p>
                      {approval.remarks && (
                        <p className="mt-2 text-sm">{approval.remarks}</p>
                      )}
                      {approval.confirmedMeals && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Confirmed Meals: {approval.confirmedMeals}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document */}
        {request.documentUrl && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Attached Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={request.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                View Document
              </a>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
