// IIT Ropar Mess Rebate System - Type Definitions

export type UserRole = 'STUDENT' | 'MESS_MANAGER' | 'CARETAKER' | 'JUNIOR_SUPERINTENDENT' | 'ADMIN'
export type Course = 'UG' | 'PG' | 'PHD'
export type RebateType = 'PERSONAL_LEAVE' | 'OFFICIAL_DUTY_LEAVE'
export type RequestStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'MESS_MANAGER_APPROVED'
  | 'MESS_MANAGER_REJECTED'
  | 'CARETAKER_APPROVED'
  | 'CARETAKER_REJECTED'
  | 'CARETAKER_SENT_BACK'
  | 'JS_APPROVED'
  | 'JS_REJECTED'
  | 'COMPLETED'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  entryNumber?: string
  course?: Course
  hostelName?: string
  roomNumber?: string
  messName?: string
}

export interface RebateRequest {
  id: string
  studentId: string
  student?: User
  rebateType: RebateType
  fromDate: Date
  toDate: Date
  totalDays: number
  totalMeals: number
  status: RequestStatus
  documentUrl?: string
  declarationAccepted: boolean
  createdAt: Date
  updatedAt: Date
  submittedAt?: Date
  approvals?: Approval[]
}

export interface Approval {
  id: string
  requestId: string
  approverRole: UserRole
  approverId?: string
  approved?: boolean
  remarks?: string
  confirmedMeals?: number
  createdAt: Date
  updatedAt: Date
}

// Workflow status display
export interface WorkflowStep {
  id: string
  label: string
  status: 'completed' | 'current' | 'pending' | 'rejected'
  timestamp?: Date
  remarks?: string
}

// Form validation constants
export const REBATE_RULES = {
  MIN_DAYS: 3,
  MAX_DAYS_PER_SEMESTER: 20,
  MEALS_PER_DAY: 3,
  MIN_ADVANCE_DAYS: 1,
} as const

// Hostel options
export const HOSTELS = [
  'Chenab Hostel',
  'Beas Hostel',
  'Satluj Hostel',
  'Ravi Hostel',
  'Jhelum Hostel',
] as const

// Mess options
export const MESSES = [
  'Main Mess',
  'North Mess',
  'South Mess',
] as const
