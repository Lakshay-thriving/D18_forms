import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/auth'
import { z } from 'zod'

const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'REGISTRAR', 'JOINT_REGISTRAR', 'ESTABLISHMENT_1', 'ESTABLISHMENT_2']).optional(),
  isApproved: z.boolean().optional(),
})

// PATCH update user - admin only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

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
    const { role, isApproved } = updateUserSchema.parse(body)

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(isApproved !== undefined && { isApproved }),
      },
    })

    // Create audit log
    await createAuditLog(
      'USER_UPDATED',
      'User',
      id,
      session.userId,
      { role, isApproved }
    )

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isApproved: updatedUser.isApproved,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[Admin] Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE user - admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    const { id } = await params

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

    // Prevent deleting self
    if (id === session.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    // Create audit log
    await createAuditLog(
      'USER_DELETED',
      'User',
      id,
      session.userId
    )

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('[Admin] Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
