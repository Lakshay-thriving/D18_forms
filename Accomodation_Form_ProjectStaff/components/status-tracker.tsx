'use client'

import { cn } from '@/lib/utils'
import { Check, X, Clock } from 'lucide-react'
import { APPROVAL_STEPS, APPLICATION_STATUS_LABELS } from '@/lib/types'

interface StatusTrackerProps {
  currentStatus: string
  className?: string
}

export function StatusTracker({ currentStatus, className }: StatusTrackerProps) {
  const statusInfo = APPLICATION_STATUS_LABELS[currentStatus]
  const currentStep = statusInfo?.step ?? 0
  const isRejected = currentStatus === 'REJECTED'
  const isSentBack = currentStatus === 'SENT_BACK_TO_APPLICANT'

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {APPROVAL_STEPS.map((step, index) => {
          const isCompleted = currentStep > step.step
          const isCurrent = currentStep === step.step
          const isPending = currentStep < step.step

          return (
            <div key={step.step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && !isRejected && !isSentBack && 'border-primary bg-primary/10 text-primary',
                    isCurrent && isSentBack && 'border-amber-500 bg-amber-500/10 text-amber-500',
                    isRejected && isCurrent && 'border-destructive bg-destructive text-destructive-foreground',
                    isPending && 'border-muted-foreground/30 bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : isRejected && isCurrent ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.step}</span>
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center max-w-[80px]',
                    (isCompleted || isCurrent) && !isRejected && !isSentBack && 'text-primary',
                    isCurrent && isSentBack && 'text-amber-500',
                    isRejected && isCurrent && 'text-destructive',
                    isPending && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < APPROVAL_STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 flex-1 mx-2 mt-[-20px]',
                    isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
      
      {isSentBack && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-amber-500/10 p-3 text-amber-600">
          <Clock className="h-5 w-5" />
          <span className="text-sm font-medium">
            Application sent back to applicant for revision
          </span>
        </div>
      )}
    </div>
  )
}
