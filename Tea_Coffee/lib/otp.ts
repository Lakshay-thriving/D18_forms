import { prisma } from "./prisma"
import { randomInt } from "crypto"

const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10

export function generateOtp(): string {
  const min = Math.pow(10, OTP_LENGTH - 1)
  const max = Math.pow(10, OTP_LENGTH) - 1
  return randomInt(min, max).toString()
}

export async function createOtp(email: string): Promise<string> {
  // Get user by email
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error(`User not found with email: ${email}`)
  }

  // Delete any existing OTPs for this user
  await prisma.otpCode.deleteMany({
    where: { userId: user.id },
  })

  const code = generateOtp()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  await prisma.otpCode.create({
    data: {
      userId: user.id,
      code,
      expiresAt,
    },
  })

  return code
}

export async function verifyOtp(email: string, code: string): Promise<boolean> {
  // Get user by email
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return false
  }

  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      userId: user.id,
      code,
      expiresAt: { gt: new Date() },
    },
  })

  if (!otpRecord) {
    return false
  }

  // Delete the OTP after successful verification
  await prisma.otpCode.delete({
    where: { id: otpRecord.id },
  })

  return true
}
