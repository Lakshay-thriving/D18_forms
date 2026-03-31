import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE_NAME = 'hostel_session'

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!sessionToken) {
    return null
  }
  
  try {
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    })
    
    if (!session || session.expiresAt < new Date()) {
      // Session expired or not found
      if (session) {
        await prisma.session.delete({ where: { id: session.id } })
      }
      return null
    }
    
    return session
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateSessionToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })
  
  return token
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function logout() {
  const session = await getSession()
  if (session) {
    await prisma.session.delete({ where: { id: session.id } })
  }
  await clearSessionCookie()
}

// Map role to dashboard path
export function getRoleDashboardPath(role: string): string {
  const paths: Record<string, string> = {
    FACULTY_SUPERVISOR: '/dashboard/faculty',
    HOD: '/dashboard/hod',
    JUNIOR_SUPERINTENDENT: '/dashboard/junior-superintendent',
    ASSISTANT_REGISTRAR: '/dashboard/assistant-registrar',
    CHIEF_WARDEN: '/dashboard/chief-warden',
  }
  return paths[role] || '/dashboard'
}

// Map role to display name
export function getRoleDisplayName(role: string): string {
  const names: Record<string, string> = {
    FACULTY_SUPERVISOR: 'Faculty Supervisor',
    HOD: 'Head of Department',
    JUNIOR_SUPERINTENDENT: 'Junior Superintendent',
    ASSISTANT_REGISTRAR: 'Assistant Registrar',
    CHIEF_WARDEN: 'Chief Warden',
  }
  return names[role] || role
}
