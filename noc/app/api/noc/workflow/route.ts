import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'

// Map roles to their workflow stage
const roleToStage: Record<string, string> = {
  REGISTRAR: 'PENDING_REGISTRAR',
  JOINT_REGISTRAR: 'PENDING_JOINT_REGISTRAR',
  ESTABLISHMENT_1: 'PENDING_ESTABLISHMENT',
  ESTABLISHMENT_2: 'PENDING_ESTABLISHMENT',
}

// Map roles to status filter - includes both forward and reply workflow stages
const roleToStatus: Record<string, string[]> = {
  // Forward workflow: REGISTRAR first, then JR, then Establishment
  // Reply workflow: Establishment signs → JR signs → REGISTRAR signs (for Passport NOC)
  REGISTRAR: ['SUBMITTED', 'PENDING_REGISTRAR', 'REPLY_REGISTRAR'],
  JOINT_REGISTRAR: ['PENDING_JOINT_REGISTRAR', 'REPLY_JOINT_REGISTRAR'],
  ESTABLISHMENT_1: ['PENDING_ESTABLISHMENT'],
  ESTABLISHMENT_2: ['PENDING_ESTABLISHMENT'],
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Admin can see all requests
    if (user.role === 'ADMIN') {
      const requests = await prisma.nOCRequest.findMany({
        where: {
          status: { not: 'DRAFT' },
        },
        include: {
          applicant: {
            select: { email: true },
          },
          approvals: true,
          signatures: {
            include: {
              signer: { select: { email: true, role: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({ success: true, requests, role: user.role })
    }

    // Get status filters for this role
    const statusFilters = roleToStatus[user.role]
    
    if (!statusFilters) {
      return NextResponse.json({ success: true, requests: [], role: user.role })
    }

    // For Establishment roles, also filter by applicant type
    let additionalFilter = {}
    if (user.role === 'ESTABLISHMENT_1') {
      additionalFilter = { applicantType: 'FACULTY' }
    } else if (user.role === 'ESTABLISHMENT_2') {
      additionalFilter = { applicantType: 'STAFF' }
    }

    const requests = await prisma.nOCRequest.findMany({
      where: {
        status: { in: statusFilters },
        ...additionalFilter,
      },
      include: {
        applicant: {
          select: { email: true },
        },
        approvals: true,
        signatures: {
          include: {
            signer: { select: { email: true, role: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      requests,
      role: user.role,
      stage: roleToStage[user.role],
    })
  } catch (error) {
    console.error('[Workflow] Error fetching requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow requests' },
      { status: 500 }
    )
  }
}
