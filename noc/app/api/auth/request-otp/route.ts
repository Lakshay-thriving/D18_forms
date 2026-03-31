import { NextRequest, NextResponse } from 'next/server'
import { createOTPVerification, isValidApplicantEmail, getUserByEmail } from '@/lib/auth'
import { sendOTPEmail, isEmailConfigured } from '@/lib/email'
import { createAuditLog } from '@/lib/auth'
import { z } from 'zod'

const requestOTPSchema = z.object({
  email: z.string().email(),
  userType: z.enum(['ADMIN', 'APPLICANT']),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userType } = requestOTPSchema.parse(body)

    // Validate applicant email domain
    if (userType === 'APPLICANT' && !isValidApplicantEmail(email)) {
      return NextResponse.json(
        { error: 'Only @iitrpr.ac.in email addresses are accepted for applicants' },
        { status: 400 }
      )
    }

    // Check if admin user exists and is approved (only for ADMIN userType)
    if (userType === 'ADMIN') {
      const user = await getUserByEmail(email)
      if (!user || !user.isApproved) {
        // Don't reveal if user exists for security
        return NextResponse.json(
          { error: 'This email is not registered in the system. Please contact the administrator.' },
          { status: 403 }
        )
      }
    }

    // Check if email service is configured
    if (!isEmailConfigured()) {
      // In development or if email is not configured, allow but log warning
      console.warn('[OTP] Email service not configured. OTP will not be sent.')
    }

    // Create OTP
    const user = userType === 'ADMIN' ? await getUserByEmail(email) : null
    const { otp, verification } = await createOTPVerification(email, user?.id)

    // Send OTP email
    const emailSent = isEmailConfigured() 
      ? await sendOTPEmail(email, otp, userType === 'ADMIN' ? 'ADMIN_LOGIN' : 'APPLICANT_REGISTRATION')
      : false

    // Log the OTP request
    await createAuditLog(
      'OTP_REQUESTED',
      'OTPVerification',
      verification.id,
      user?.id,
      {
        email,
        userType,
        emailSent,
      }
    )

    // In development mode, return OTP for testing
    const devMode = process.env.DEV_MODE === 'true'
    const response: any = {
      success: true,
      message: 'OTP has been sent to your email',
      verificationId: verification.id,
    }

    if (devMode) {
      response.devOTP = otp
      response.message = `[DEV] OTP: ${otp}`
      console.log(`\n🔐 [DEV MODE] OTP for ${email}: ${otp}\n`)
    }

    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[Auth] Error requesting OTP:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
