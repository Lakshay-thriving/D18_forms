'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { MALE_HOSTELS, FEMALE_HOSTELS } from '@/lib/types'
import { Check, X, RotateCcw, ArrowRight } from 'lucide-react'

interface ApprovalFormProps {
  applicationId: string
  role: string
  applicantGender?: string
  showAllocation?: boolean
  actions: Array<{
    value: string
    label: string
    variant?: 'default' | 'destructive' | 'secondary'
    icon?: 'check' | 'x' | 'back' | 'forward'
  }>
  redirectPath: string
}

export function ApprovalForm({
  applicationId,
  role,
  applicantGender,
  showAllocation = false,
  actions,
  redirectPath,
}: ApprovalFormProps) {
  const router = useRouter()
  const [remarks, setRemarks] = React.useState('')
  const [signature, setSignature] = React.useState('')
  const [selectedAction, setSelectedAction] = React.useState('')
  const [hostel, setHostel] = React.useState('')
  const [roomNumber, setRoomNumber] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const hostels = applicantGender === 'MALE' ? MALE_HOSTELS : FEMALE_HOSTELS

  const handleSubmit = async (action: string) => {
    if (!signature.trim()) {
      toast.error('Please provide your digital signature')
      return
    }

    if (showAllocation && action === 'PROCEED_TO_ALLOCATION' && !hostel) {
      toast.error('Please select a hostel')
      return
    }

    setSelectedAction(action)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          action,
          remarks: remarks.trim() || null,
          signature: signature.trim(),
          hostel: hostel || undefined,
          roomNumber: roomNumber.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit')
      }

      toast.success('Action submitted successfully')
      router.push(redirectPath)
      router.refresh()
    } catch (error) {
      console.error('Error submitting approval:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
      setSelectedAction('')
    }
  }

  const getIcon = (icon?: string) => {
    switch (icon) {
      case 'check':
        return <Check className="mr-2 h-4 w-4" />
      case 'x':
        return <X className="mr-2 h-4 w-4" />
      case 'back':
        return <RotateCcw className="mr-2 h-4 w-4" />
      case 'forward':
        return <ArrowRight className="mr-2 h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Take Action</CardTitle>
        <CardDescription>
          Review the application and provide your decision
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAllocation && (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Allocate Hostel <span className="text-destructive">*</span>
              </label>
              <Select value={hostel} onValueChange={setHostel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select hostel" />
                </SelectTrigger>
                <SelectContent>
                  {hostels.map((h) => (
                    <SelectItem key={h.value} value={h.value}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Room Number (Optional)
              </label>
              <Input
                placeholder="Enter room number if known"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium mb-2 block">
            Remarks {showAllocation ? '' : '(Optional)'}
          </label>
          <Textarea
            placeholder="Add any remarks or comments..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Digital Signature <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Type your full name as signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {actions.map((action) => (
            <Button
              key={action.value}
              variant={action.variant || 'default'}
              onClick={() => handleSubmit(action.value)}
              disabled={isSubmitting}
            >
              {isSubmitting && selectedAction === action.value ? (
                <Spinner className="mr-2" />
              ) : (
                getIcon(action.icon)
              )}
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
