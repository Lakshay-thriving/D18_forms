'use client'

import { cn } from '@/lib/utils'
import { Check, Clock, X, AlertCircle } from 'lucide-react'
import type { RequestStatus } from '@/lib/types'

interface StatusStep {
  label: string
  status: 'completed' | 'current' | 'pending' | 'rejected'
  timestamp?: string
}

function getStatusSteps(status: RequestStatus): StatusStep[] {
  const steps: StatusStep[] = [
    { label: 'Submitted', status: 'pending' },
    { label: 'Mess Manager Review', status: 'pending' },
    { label: 'Caretaker Review', status: 'pending' },
    { label: 'Jr. Superintendent Approval', status: 'pending' },
    { label: 'Completed', status: 'pending' },
  ]

  switch (status) {
    case 'DRAFT':
      return steps
    case 'SUBMITTED':
      steps[0].status = 'completed'
      steps[1].status = 'current'
      steps[2].status = 'current' // Parallel flow
      return steps
    case 'MESS_MANAGER_APPROVED':
      steps[0].status = 'completed'
      steps[1].status = 'completed'
      steps[2].status = 'current'
      return steps
    case 'MESS_MANAGER_REJECTED':
      steps[0].status = 'completed'
      steps[1].status = 'rejected'
      return steps
    case 'CARETAKER_APPROVED':
      steps[0].status = 'completed'
      steps[1].status = 'completed'
      steps[2].status = 'completed'
      steps[3].status = 'current'
      return steps
    case 'CARETAKER_REJECTED':
      steps[0].status = 'completed'
      steps[1].status = 'completed'
      steps[2].status = 'rejected'
      return steps
    case 'CARETAKER_SENT_BACK':
      steps[0].status = 'completed'
      steps[1].status = 'completed'
      steps[2].status = 'rejected'
      return steps
    case 'JS_APPROVED':
    case 'COMPLETED':
      steps[0].status = 'completed'
      steps[1].status = 'completed'
      steps[2].status = 'completed'
      steps[3].status = 'completed'
      steps[4].status = 'completed'
      return steps
    case 'JS_REJECTED':
      steps[0].status = 'completed'
      steps[1].status = 'completed'
      steps[2].status = 'completed'
      steps[3].status = 'rejected'
      return steps
    default:
      return steps
  }
}

function StatusIcon({ status }: { status: StatusStep['status'] }) {
  switch (status) {
    case 'completed':
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-4 w-4" />
        </div>
      )
    case 'current':
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Clock className="h-4 w-4" />
        </div>
      )
    case 'rejected':
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
          <X className="h-4 w-4" />
        </div>
      )
    case 'pending':
    default:
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background">
          <div className="h-2 w-2 rounded-full bg-muted" />
        </div>
      )
  }
}

interface StatusTrackerProps {
  status: RequestStatus
  className?: string
}

export function StatusTracker({ status, className }: StatusTrackerProps) {
  const steps = getStatusSteps(status)

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <StatusIcon status={step.status} />
              <span
                className={cn(
                  'mt-2 text-center text-xs',
                  step.status === 'completed' && 'text-accent',
                  step.status === 'current' && 'font-medium text-primary',
                  step.status === 'rejected' && 'text-destructive',
                  step.status === 'pending' && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 flex-1',
                  step.status === 'completed' ? 'bg-accent' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config: Record<RequestStatus, { label: string; className: string; icon: React.ReactNode }> = {
    DRAFT: {
      label: 'Draft',
      className: 'bg-muted text-muted-foreground',
      icon: <AlertCircle className="h-3 w-3" />,
    },
    SUBMITTED: {
      label: 'Submitted',
      className: 'bg-primary/10 text-primary',
      icon: <Clock className="h-3 w-3" />,
    },
    MESS_MANAGER_APPROVED: {
      label: 'MM Approved',
      className: 'bg-accent/10 text-accent',
      icon: <Check className="h-3 w-3" />,
    },
    MESS_MANAGER_REJECTED: {
      label: 'MM Rejected',
      className: 'bg-destructive/10 text-destructive',
      icon: <X className="h-3 w-3" />,
    },
    CARETAKER_APPROVED: {
      label: 'CT Approved',
      className: 'bg-accent/10 text-accent',
      icon: <Check className="h-3 w-3" />,
    },
    CARETAKER_REJECTED: {
      label: 'CT Rejected',
      className: 'bg-destructive/10 text-destructive',
      icon: <X className="h-3 w-3" />,
    },
    CARETAKER_SENT_BACK: {
      label: 'Sent Back',
      className: 'bg-warning text-warning-foreground',
      icon: <AlertCircle className="h-3 w-3" />,
    },
    JS_APPROVED: {
      label: 'Approved',
      className: 'bg-accent text-accent-foreground',
      icon: <Check className="h-3 w-3" />,
    },
    JS_REJECTED: {
      label: 'Rejected',
      className: 'bg-destructive text-destructive-foreground',
      icon: <X className="h-3 w-3" />,
    },
    COMPLETED: {
      label: 'Completed',
      className: 'bg-accent text-accent-foreground',
      icon: <Check className="h-3 w-3" />,
    },
  }

  const { label, className, icon } = config[status]

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', className)}>
      {icon}
      {label}
    </span>
  )
}
