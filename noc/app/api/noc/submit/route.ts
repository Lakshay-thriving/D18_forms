import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/auth'
import { z } from 'zod'

const submitNOCSchema = z.object({
  requestId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { requestId } = submitNOCSchema.parse(body)

    // Get NOC request
    const nocRequest = await prisma.nOCRequest.findUnique({
      where: { requestId },
      include: { applicant: true },
    })

    if (!nocRequest) {
      return NextResponse.json(
        { error: 'NOC request not found' },
        { status: 404 }
      )
    }

    // Verify applicant owns this request
    if (nocRequest.applicantId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Can only submit draft requests
    if (nocRequest.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Request has already been submitted' },
        { status: 400 }
      )
    }

    // Update request status
    const updated = await prisma.nOCRequest.update({
      where: { requestId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        currentStage: 'PENDING_REGISTRAR',
      },
    })

    // Create initial approval entry for Registrar
    await prisma.nOCApproval.create({
      data: {
        requestId: nocRequest.id,
        approverRole: 'REGISTRAR',
        status: 'pending',
      },
    })

    // Create audit log
    await createAuditLog(
      'NOC_REQUEST_SUBMITTED',
      'NOCRequest',
      nocRequest.id,
      session.userId,
      { requestId }
    )

    return NextResponse.json({
      success: true,
      message: 'NOC request submitted successfully',
      request: {
        requestId: updated.requestId,
        status: updated.status,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[NOC] Error submitting request:', error)
    return NextResponse.json(
      { error: 'Failed to submit NOC request' },
      { status: 500 }
    )
  }
}
