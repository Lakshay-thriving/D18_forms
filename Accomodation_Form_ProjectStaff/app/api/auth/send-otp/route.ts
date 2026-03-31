import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please sign up or contact administrator.' },
        { status: 404 }
      )
    }
    
    // Generate OTP
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    // Delete any existing OTPs for this email
    await prisma.oTP.deleteMany({
      where: { email: email.toLowerCase() },
    })
    
    // Create new OTP
    await prisma.oTP.create({
      data: {
        email: email.toLowerCase(),
        code,
        expiresAt,
      },
    })
    
    // Send OTP via email
    const emailSent = await sendOtpEmail(email, code, user.name)
    
    if (!emailSent) {
      console.warn(`[Auth] Email sending failed for ${email}, but OTP was generated`)
      // In development/demo, return the OTP for testing purposes
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          success: true,
          message: 'OTP generated (email sending is disabled - demo mode)',
          demoOtp: code,
        })
      }
      // In production, don't reveal the OTP
      return NextResponse.json({
        success: true,
        message: 'OTP has been sent to your email. If you don\'t receive it, please check your spam folder or try again in a few minutes.',
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'OTP has been sent to your email',
    })
    
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
