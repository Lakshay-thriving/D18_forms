import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, getSession } from '@/lib/session'
import { createAuditLog } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // Create audit log
    if (session) {
      await createAuditLog(
        'LOGOUT',
        'User',
        session.userId,
        session.userId,
        { email: session.email }
      )
    }

    // Clear session cookie
    await clearSessionCookie()

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('[Auth] Error during logout:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
