import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession, requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/auth'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'REGISTRAR', 'JOINT_REGISTRAR', 'ESTABLISHMENT_1', 'ESTABLISHMENT_2']),
})

// GET all users - admin only
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Check if admin
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      users,
    })
  } catch (error) {
    console.error('[Admin] Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST create user - admin only
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Check if admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (adminUser?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, role } = createUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        role,
        isApproved: true, // Admin creates pre-approved users
      },
    })

    // Create audit log
    await createAuditLog(
      'USER_CREATED',
      'User',
      newUser.id,
      session.userId,
      { email, role }
    )

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isApproved: newUser.isApproved,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[Admin] Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
