'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { StatusTracker, StatusBadge } from '@/components/status-tracker'
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Check,
  X,
  RotateCcw,
  AlertCircle,
} from 'lucide-react'
import type { RequestStatus, UserRole } from '@/lib/types'

interface ApprovalFormProps {
  request: {
    id: string
    status: RequestStatus
    rebateType: string
    fromDate: Date
    toDate: Date
    totalDays: number
    totalMeals: number
    documentUrl: string | null
    student: {
      name: string
      entryNumber: string | null
      course: string | null
      hostelName: string | null
      roomNumber: string | null
      messName: string | null
    }
    approvals: {
      id: string
      approverRole: string
      approved: boolean | null
      remarks: string | null
      confirmedMeals: number | null
      createdAt: Date
    }[]
  }
  userRole: UserRole
  canTakeAction: boolean
}

export function ApprovalForm({ request, userRole, canTakeAction }: ApprovalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remarks, setRemarks] = useState('')
  const [confirmedMeals, setConfirmedMeals] = useState(request.totalMeals)

  async function handleAction(action: 'approve' | 'reject' | 'sendBack') {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/rebate/${request.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved: action === 'approve',
          sendBack: action === 'sendBack',
          remarks,
          confirmedMeals: userRole === 'MESS_MANAGER' ? confirmedMeals : undefined,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to process action')
      }

      router.push('/approvals')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/approvals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Approvals
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review Request</h1>
          <p className="text-muted-foreground">
            Request ID: {request.id.slice(0, 8)}...
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Status Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Request Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTracker status={request.status} />
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

      {/* Document */}
      {request.documentUrl && (
        <Card>
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

      {/* Previous Approvals */}
      {request.approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Previous Actions</CardTitle>
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

      {/* Action Form */}
      {canTakeAction && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Take Action</CardTitle>
            <CardDescription>
              {userRole === 'MESS_MANAGER' && 'Verify dates and confirm meal count'}
              {userRole === 'CARETAKER' && 'Verify student details and hostel records'}
              {userRole === 'JUNIOR_SUPERINTENDENT' && 'Provide final approval'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userRole === 'MESS_MANAGER' && (
              <div className="space-y-2">
                <Label htmlFor="confirmedMeals">Confirmed Meal Count</Label>
                <Input
                  id="confirmedMeals"
                  type="number"
                  value={confirmedMeals}
                  onChange={(e) => setConfirmedMeals(Number(e.target.value))}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Calculated: {request.totalDays} days x 3 meals = {request.totalMeals} meals
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Add any comments or notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                onClick={() => handleAction('approve')}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting && <Spinner className="mr-2" />}
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>

              {userRole === 'CARETAKER' && (
                <Button
                  variant="outline"
                  onClick={() => handleAction('sendBack')}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Send Back
                </Button>
              )}

              <Button
                variant="destructive"
                onClick={() => handleAction('reject')}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!canTakeAction && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This request is not available for your action at this time.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
