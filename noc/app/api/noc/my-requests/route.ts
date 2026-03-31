import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Get all NOC requests for this applicant
    const requests = await prisma.nOCRequest.findMany({
      where: { applicantId: session.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        requestId: true,
        status: true,
        purpose: true,
        certificateType: true,
        createdAt: true,
        submittedAt: true,
        currentStage: true,
      },
    })

    // Calculate stats
    const total = requests.length
    const pending = requests.filter(r => 
      ['SUBMITTED', 'PENDING_REGISTRAR', 'PENDING_JOINT_REGISTRAR', 'PENDING_ESTABLISHMENT'].includes(r.status)
    ).length
    const approved = requests.filter(r => 
      ['APPROVED', 'COMPLETED'].includes(r.status)
    ).length
    const rejected = requests.filter(r => r.status === 'REJECTED').length
    const draft = requests.filter(r => r.status === 'DRAFT').length

    return NextResponse.json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
        draft,
      },
      requests,
    })
  } catch (error) {
    console.error('[NOC] Error fetching requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NOC requests' },
      { status: 500 }
    )
  }
}
