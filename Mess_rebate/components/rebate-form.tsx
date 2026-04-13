'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, differenceInDays, addDays } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { CalendarIcon, Upload, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { REBATE_RULES } from '@/lib/types'
import type { User } from '@/lib/types'

const formSchema = z.object({
  rebateType: z.enum(['PERSONAL_LEAVE', 'OFFICIAL_DUTY_LEAVE'], {
    required_error: 'Please select a rebate type',
  }),
  fromDate: z.date({
    required_error: 'Start date is required',
  }),
  toDate: z.date({
    required_error: 'End date is required',
  }),
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the declaration',
  }),
})

type FormData = z.infer<typeof formSchema>

interface RebateFormProps {
  user: User
  remainingDays: number
}

export function RebateForm({ user, remainingDays }: RebateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  const tomorrow = addDays(new Date(), 1)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rebateType: undefined,
      fromDate: undefined,
      toDate: undefined,
      declarationAccepted: false,
    },
  })

  const watchFromDate = form.watch('fromDate')
  const watchToDate = form.watch('toDate')
  const watchRebateType = form.watch('rebateType')

  const calculations = useMemo(() => {
    if (!watchFromDate || !watchToDate) return null
    const totalDays = differenceInDays(watchToDate, watchFromDate) + 1
    const totalMeals = totalDays * REBATE_RULES.MEALS_PER_DAY
    return { totalDays, totalMeals }
  }, [watchFromDate, watchToDate])

  const validationErrors = useMemo(() => {
    const errors: string[] = []
    if (calculations) {
      if (calculations.totalDays < REBATE_RULES.MIN_DAYS) {
        errors.push(`Minimum ${REBATE_RULES.MIN_DAYS} days required for rebate`)
      }
      if (calculations.totalDays > remainingDays) {
        errors.push(`You only have ${remainingDays} days remaining this semester`)
      }
    }
    if (watchRebateType === 'OFFICIAL_DUTY_LEAVE' && !documentFile) {
      errors.push('Document is required for Official/Duty Leave')
    }
    return errors
  }, [calculations, remainingDays, watchRebateType, documentFile])

  async function onSubmit(data: FormData) {
    if (validationErrors.length > 0) {
      setError(validationErrors[0])
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('rebateType', data.rebateType)
      formData.append('fromDate', data.fromDate.toISOString())
      formData.append('toDate', data.toDate.toISOString())
      formData.append('declarationAccepted', String(data.declarationAccepted))
      if (documentFile) {
        formData.append('document', documentFile)
      }

      const response = await fetch('/api/rebate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to submit request')
      }

      router.push('/rebate/history')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Student Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
          <CardDescription>Your registered information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{user.name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Entry Number</Label>
              <p className="font-medium">{user.entryNumber}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Course</Label>
              <p className="font-medium">{user.course}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Hostel</Label>
              <p className="font-medium">{user.hostelName}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Room Number</Label>
              <p className="font-medium">{user.roomNumber}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Mess</Label>
              <p className="font-medium">{user.messName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rebate Type Section */}
      <Card>
        <CardHeader>
          <CardTitle>Rebate Type</CardTitle>
          <CardDescription>Select the reason for your rebate request</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            onValueChange={(value) => form.setValue('rebateType', value as FormData['rebateType'])}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center space-x-3 rounded-lg border p-4">
              <RadioGroupItem value="PERSONAL_LEAVE" id="personal" />
              <Label htmlFor="personal" className="flex-1 cursor-pointer">
                <span className="font-medium">Personal Leave</span>
                <p className="text-sm text-muted-foreground">
                  For personal reasons such as family visits, health issues, etc.
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border p-4">
              <RadioGroupItem value="OFFICIAL_DUTY_LEAVE" id="official" />
              <Label htmlFor="official" className="flex-1 cursor-pointer">
                <span className="font-medium">Official/Duty Leave</span>
                <p className="text-sm text-muted-foreground">
                  For official institute activities, internships, conferences, etc.
                </p>
              </Label>
            </div>
          </RadioGroup>
          {form.formState.errors.rebateType && (
            <p className="mt-2 text-sm text-destructive">{form.formState.errors.rebateType.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Date Selection Section */}
      <Card>
        <CardHeader>
          <CardTitle>Rebate Period</CardTitle>
          <CardDescription>Select the dates for your rebate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watchFromDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchFromDate ? format(watchFromDate, 'PPP') : 'Select start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchFromDate}
                    onSelect={(date) => {
                      form.setValue('fromDate', date as Date)
                      if (watchToDate && date && date > watchToDate) {
                        form.setValue('toDate', undefined as unknown as Date)
                      }
                    }}
                    disabled={(date) => date < tomorrow}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.fromDate && (
                <p className="text-sm text-destructive">{form.formState.errors.fromDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watchToDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchToDate ? format(watchToDate, 'PPP') : 'Select end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={watchToDate}
                    onSelect={(date) => form.setValue('toDate', date as Date)}
                    disabled={(date) => date < (watchFromDate || tomorrow)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.toDate && (
                <p className="text-sm text-destructive">{form.formState.errors.toDate.message}</p>
              )}
            </div>
          </div>

          {calculations && (
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-primary" />
                <span className="font-medium">Calculation Summary</span>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Days</p>
                  <p className="text-lg font-semibold">{calculations.totalDays}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Meals</p>
                  <p className="text-lg font-semibold">{calculations.totalMeals}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining Days</p>
                  <p className="text-lg font-semibold">{remainingDays - calculations.totalDays}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Upload Section */}
      {watchRebateType === 'OFFICIAL_DUTY_LEAVE' && (
        <Card>
          <CardHeader>
            <CardTitle>Supporting Documents</CardTitle>
            <CardDescription>Upload duty leave approval or supporting documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {documentFile && (
                <span className="text-sm text-muted-foreground">{documentFile.name}</span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Accepted formats: PDF, JPG, PNG (Max 5MB)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Declaration Section */}
      <Card>
        <CardHeader>
          <CardTitle>Declaration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="declaration"
              checked={form.watch('declarationAccepted')}
              onCheckedChange={(checked) => form.setValue('declarationAccepted', checked as boolean)}
            />
            <Label htmlFor="declaration" className="cursor-pointer leading-relaxed">
              I confirm that the above information is correct and I will submit my Mess ID card
              during the rebate period. I understand that providing false information may result in
              disciplinary action.
            </Label>
          </div>
          {form.formState.errors.declarationAccepted && (
            <p className="mt-2 text-sm text-destructive">
              {form.formState.errors.declarationAccepted.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-inside list-disc">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || validationErrors.length > 0}>
          {isSubmitting && <Spinner className="mr-2" />}
          Submit Request
        </Button>
      </div>
    </form>
  )
}
