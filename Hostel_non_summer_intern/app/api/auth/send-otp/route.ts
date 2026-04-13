import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOtp } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, name, role } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // For applicants, create new user
      if (role === 'APPLICANT') {
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            role: 'APPLICANT',
          },
        })
      } else {
        return NextResponse.json(
          { error: 'User not found. Only applicants can self-register.' },
          { status: 404 }
        )
      }
    }

    // Generate OTP
    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete any existing OTP sessions for this user
    await prisma.otpSession.deleteMany({
      where: { userId: user.id },
    })

    // Create new OTP session
    await prisma.otpSession.create({
      data: {
        userId: user.id,
        otp,
        expiresAt,
      },
    })

    // Send OTP email
    await sendOtpEmail(email, otp, user.name)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      userId: user.id,
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
