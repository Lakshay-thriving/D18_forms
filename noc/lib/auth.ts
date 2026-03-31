import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create an OTP verification record
 */
export async function createOTPVerification(email: string, userId?: string) {
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES || '5') * 60 * 1000))

  const verification = await prisma.oTPVerification.create({
    data: {
      email,
      otp,
      expiresAt,
      userId: userId || null,
    },
  })

  return { otp, verification }
}

/**
 * Verify OTP and mark as used
 */
export async function verifyOTP(email: string, otp: string) {
  const verification = await prisma.oTPVerification.findFirst({
    where: {
      email,
      otp,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  if (!verification) {
    return null
  }

  // Mark as used
  await prisma.oTPVerification.update({
    where: { id: verification.id },
    data: { isUsed: true },
  })

  return verification
}

/**
 * Get user by email (if approved)
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

/**
 * Check if user is admin
 */
export async function isAdminUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  return user?.role === 'ADMIN'
}

/**
 * Check if applicant email is valid (ends with iitrpr.ac.in)
 */
export function isValidApplicantEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@iitrpr.ac.in')
}

/**
 * Create audit log
 */
export async function createAuditLog(
  action: string,
  entity: string,
  entityId: string,
  userId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
) {
  return prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      userId: userId || null,
      details: details ? JSON.stringify(details) : null,
      ipAddress: ipAddress || null,
    },
  })
}
