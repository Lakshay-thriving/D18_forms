import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()
    
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    const emailLower = email.toLowerCase()

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 409 }
      )
    }

    // Create new applicant user
    const newUser = await prisma.user.create({
      data: {
        email: emailLower,
        name,
        role: 'APPLICANT',
        isApplicantVerified: false,
      },
    })

    // Generate and send OTP
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.oTP.create({
      data: {
        email: emailLower,
        code,
        expiresAt,
      },
    })

    // Send verification OTP
    const emailSent = await sendOtpEmail(email, code, name)

    if (!emailSent && process.env.NODE_ENV === 'production') {
      // Clean up the user if email sending failed in production
      await prisma.user.delete({ where: { id: newUser.id } })
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Applicant account created. OTP has been sent to your email.',
      email: emailLower,
      demoOtp: !emailSent ? code : undefined, // For development
    }, { status: 201 })
    
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
