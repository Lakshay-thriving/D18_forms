export type Role = "ADMIN" | "PA" | "VENDOR"
export type SlipStatus = "PENDING" | "PREPARING" | "DELIVERED"
export type AuthRole = "PS" | "PA" | "REGISTRAR" | "DEAN" | "HOD"

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface Slip {
  id: string
  slipNumber: string
  guestName: string
  roomNumber?: string | null
  teaCount: number
  coffeeCount: number
  instructions: string | null
  authorizedBy?: AuthRole | null
  signature?: string | null
  status: SlipStatus
  createdById: string
  createdBy?: User
  createdAt: Date
  updatedAt: Date
}

export interface SlipCreateInput {
  guestName: string
  roomNumber?: string
  teaCount: number
  coffeeCount: number
  instructions?: string
  authorizedBy?: AuthRole
  signature?: string
}
