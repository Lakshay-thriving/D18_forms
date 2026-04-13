import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return token
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const userId = verified.payload.userId as string
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    return user
  } catch {
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    APPLICANT: 'Applicant',
    FACULTY_MENTOR: 'Faculty Mentor',
    HOD: 'Head of Department',
    JUNIOR_SUPERINTENDENT: 'Junior Superintendent',
    ASSISTANT_REGISTRAR: 'Assistant Registrar',
    CHIEF_WARDEN: 'Chief Warden',
  }
  return roleNames[role] || role
}

export function getStatusDisplayName(status: string): string {
  const statusNames: Record<string, string> = {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    FACULTY_APPROVED: 'Faculty Approved',
    FACULTY_REJECTED: 'Faculty Rejected',
    HOD_APPROVED: 'HOD Approved',
    HOD_REJECTED: 'HOD Rejected',
    JS_REVIEWED: 'JS Reviewed',
    JS_SENT_BACK: 'Sent Back for Corrections',
    HOSTEL_ALLOCATED: 'Hostel Allocated',
    AR_APPROVED: 'AR Approved',
    AR_REJECTED: 'AR Rejected',
    CHIEF_WARDEN_APPROVED: 'Approved by Chief Warden',
    CHIEF_WARDEN_REJECTED: 'Rejected by Chief Warden',
    COMPLETED: 'Completed',
  }
  return statusNames[status] || status
}
