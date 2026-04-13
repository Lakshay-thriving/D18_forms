import { z } from 'zod'
import { REBATE_RULES } from './types'

// Student registration schema
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  entryNumber: z.string().min(4, 'Entry number is required'),
  course: z.enum(['UG', 'PG', 'PHD'], { required_error: 'Course is required' }),
  hostelName: z.string().min(1, 'Hostel name is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
  messName: z.string().min(1, 'Mess name is required'),
})

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Rebate request schema
export const rebateRequestSchema = z.object({
  rebateType: z.enum(['PERSONAL_LEAVE', 'OFFICIAL_DUTY_LEAVE'], {
    required_error: 'Rebate type is required',
  }),
  fromDate: z.date({
    required_error: 'Start date is required',
  }),
  toDate: z.date({
    required_error: 'End date is required',
  }),
  documentUrl: z.string().optional(),
  declarationAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the declaration',
  }),
}).refine((data) => {
  // Validate dates
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const fromDate = new Date(data.fromDate)
  fromDate.setHours(0, 0, 0, 0)
  
  // Must apply at least 1 day in advance
  const minFromDate = new Date(today)
  minFromDate.setDate(minFromDate.getDate() + REBATE_RULES.MIN_ADVANCE_DAYS)
  
  return fromDate >= minFromDate
}, {
  message: `Must apply at least ${REBATE_RULES.MIN_ADVANCE_DAYS} day(s) in advance`,
  path: ['fromDate'],
}).refine((data) => {
  return data.toDate >= data.fromDate
}, {
  message: 'End date must be after start date',
  path: ['toDate'],
}).refine((data) => {
  const diffTime = Math.abs(data.toDate.getTime() - data.fromDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return diffDays >= REBATE_RULES.MIN_DAYS
}, {
  message: `Minimum ${REBATE_RULES.MIN_DAYS} days required for rebate`,
  path: ['toDate'],
}).refine((data) => {
  // If official/duty leave, document is required
  if (data.rebateType === 'OFFICIAL_DUTY_LEAVE' && !data.documentUrl) {
    return false
  }
  return true
}, {
  message: 'Document is required for Official/Duty Leave',
  path: ['documentUrl'],
})

// Approval schema
export const approvalSchema = z.object({
  approved: z.boolean(),
  remarks: z.string().optional(),
  confirmedMeals: z.number().optional(),
})

// Calculate total days between two dates
export function calculateTotalDays(fromDate: Date, toDate: Date): number {
  const diffTime = Math.abs(toDate.getTime() - fromDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

// Calculate total meals (days * 3)
export function calculateTotalMeals(totalDays: number): number {
  return totalDays * REBATE_RULES.MEALS_PER_DAY
}

// Validate rebate days against semester limit
export function validateSemesterLimit(
  usedDays: number,
  requestedDays: number
): { valid: boolean; message?: string } {
  const totalDays = usedDays + requestedDays
  if (totalDays > REBATE_RULES.MAX_DAYS_PER_SEMESTER) {
    return {
      valid: false,
      message: `Exceeds semester limit. You have ${REBATE_RULES.MAX_DAYS_PER_SEMESTER - usedDays} days remaining.`,
    }
  }
  return { valid: true }
}

// Get current semester string
export function getCurrentSemester(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  // Jan-June = SPRING, July-Dec = FALL
  const season = month < 6 ? 'SPRING' : 'FALL'
  return `${year}-${season}`
}

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RebateRequestInput = z.infer<typeof rebateRequestSchema>
export type ApprovalInput = z.infer<typeof approvalSchema>
