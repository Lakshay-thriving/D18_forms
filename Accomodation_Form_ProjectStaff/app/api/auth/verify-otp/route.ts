import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSession, setSessionCookie, getRoleDashboardPath } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json()
    
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }
    
    // Find the OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email: email.toLowerCase(),
        code: otp,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    })
    
    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }
    
    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    })
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Create session
    const token = await createSession(user.id)
    
    // Set session cookie
    await setSessionCookie(token)
    
    // Get redirect path based on role
    const redirectPath = getRoleDashboardPath(user.role)
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectPath,
    })
    
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
