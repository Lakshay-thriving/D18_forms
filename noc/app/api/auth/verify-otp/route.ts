import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP, getUserByEmail, createAuditLog } from '@/lib/auth'
import { createToken, setSessionCookie } from '@/lib/session'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  userType: z.enum(['ADMIN', 'APPLICANT']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, userType } = verifyOTPSchema.parse(body)

    // Verify OTP
    const verification = await verifyOTP(email, otp)
    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Get or create user
    let user = await getUserByEmail(email)

    if (!user) {
      if (userType === 'ADMIN') {
        return NextResponse.json(
          { error: 'This email is not registered in the system' },
          { status: 403 }
        )
      }

      // Create applicant user
      user = await prisma.user.create({
        data: {
          email,
          role: 'APPLICANT',
          isApproved: true, // Applicants don't need admin approval
        },
      })
    } else if (userType === 'ADMIN' && !user.isApproved) {
      return NextResponse.json(
        { error: 'Your account has not been approved yet' },
        { status: 403 }
      )
    }

    // Create session token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Set session cookie
    await setSessionCookie(token)

    // Create audit log
    await createAuditLog(
      'LOGIN',
      'User',
      user.id,
      user.id,
      { email, userType, loginMethod: 'OTP' }
    )

    // Return user info and redirect URL based on role
    let redirectUrl = '/applicant/dashboard'
    if (user.role === 'ADMIN') {
      redirectUrl = '/admin/dashboard'
    } else if (['REGISTRAR', 'JOINT_REGISTRAR', 'ESTABLISHMENT_1', 'ESTABLISHMENT_2'].includes(user.role)) {
      redirectUrl = '/workflow/dashboard'
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      redirectUrl,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[Auth] Error verifying OTP:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
