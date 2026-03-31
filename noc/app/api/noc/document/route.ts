import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/auth'
import crypto from 'crypto'

/**
 * GET - Fetch document for viewing/printing
 * Records print history and returns document with signatures
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')
    const action = searchParams.get('action') || 'view' // 'view' or 'print'

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const nocRequest = await prisma.nOCRequest.findUnique({
      where: { requestId },
      include: {
        applicant: {
          select: { email: true },
        },
        signatures: {
          orderBy: { signedAt: 'asc' },
          include: {
            signer: {
              select: { email: true, role: true },
            },
          },
        },
        approvals: {
          orderBy: { createdAt: 'asc' },
          include: {
            approver: {
              select: { email: true, role: true },
            },
          },
        },
        printHistory: {
          orderBy: { version: 'desc' },
          take: 10,
        },
      },
    })

    if (!nocRequest) {
      return NextResponse.json({ error: 'NOC request not found' }, { status: 404 })
    }

    // Check authorization - user must be applicant, approver, or admin
    const isApplicant = nocRequest.applicantId === user.id
    const isAdmin = user.role === 'ADMIN'
    const isWorkflowUser = ['REGISTRAR', 'JOINT_REGISTRAR', 'ESTABLISHMENT_1', 'ESTABLISHMENT_2'].includes(user.role)

    if (!isApplicant && !isAdmin && !isWorkflowUser) {
      return NextResponse.json({ error: 'Not authorized to view this document' }, { status: 403 })
    }

    // Generate document data for printing
    const documentData = {
      requestId: nocRequest.requestId,
      status: nocRequest.status,
      currentStage: nocRequest.currentStage,
      applicant: nocRequest.applicant.email,
      purpose: nocRequest.purpose,
      certificateType: nocRequest.certificateType,
      applicantType: nocRequest.applicantType,
      passportType: nocRequest.passportType,
      designation: nocRequest.designation,
      department: nocRequest.department,
      employeeCode: nocRequest.employeeCode,
      presentAddress: nocRequest.presentAddress,
      permanentAddress: nocRequest.permanentAddress,
      submittedAt: nocRequest.submittedAt,
      createdAt: nocRequest.createdAt,
      signatures: nocRequest.signatures.map((sig: { stage: string; signerEmail: string; signerRole: string; signedAt: Date; signatureHash: string; isVerified: boolean; signatureData: string }) => ({
        stage: sig.stage,
        signerEmail: sig.signerEmail,
        signerRole: sig.signerRole,
        signedAt: sig.signedAt,
        signatureHash: sig.signatureHash,
        isVerified: sig.isVerified,
        // Include signature image for display
        signatureData: sig.signatureData,
      })),
      // Filter out pending approvals if there's a completed (approved/rejected/signed) one for the same role
      approvals: nocRequest.approvals
        .filter((approval: { approverRole: string; status: string }) => {
          // If this approval is not pending, always include it
          if (approval.status !== 'pending') return true
          // If pending, check if there's a completed approval for the same role
          const hasCompletedApproval = nocRequest.approvals.some(
            (a: { approverRole: string; status: string }) =>
              a.approverRole === approval.approverRole &&
              a.status !== 'pending'
          )
          // Only include pending if there's no completed one
          return !hasCompletedApproval
        })
        .map((approval: { approverRole: string; approver?: { email: string } | null; status: string; comments: string | null; approvedAt: Date | null; rejectedAt: Date | null }) => ({
        approverRole: approval.approverRole,
        approverEmail: approval.approver?.email,
        status: approval.status,
        comments: approval.comments,
        approvedAt: approval.approvedAt,
        rejectedAt: approval.rejectedAt,
      })),
    }

    // If printing, record in print history
    if (action === 'print') {
      // Get next version number
      const lastPrint = await prisma.printHistory.findFirst({
        where: { requestId: nocRequest.id },
        orderBy: { version: 'desc' },
      })
      const nextVersion = (lastPrint?.version || 0) + 1

      await prisma.printHistory.create({
        data: {
          requestId: nocRequest.id,
          printedById: user.id,
          version: nextVersion,
          statusAtPrint: nocRequest.status,
          stageAtPrint: nocRequest.currentStage,
          documentData: JSON.stringify(documentData),
        },
      })

      await createAuditLog('NOC_DOCUMENT_PRINTED', 'NOCRequest', nocRequest.id, user.id, {
        requestId,
        version: nextVersion,
        status: nocRequest.status,
      })
    }

    // Get print history
    const printHistory = nocRequest.printHistory.map((ph: { version: number; statusAtPrint: string; stageAtPrint: string | null; printedAt: Date }) => ({
      version: ph.version,
      statusAtPrint: ph.statusAtPrint,
      stageAtPrint: ph.stageAtPrint,
      printedAt: ph.printedAt,
    }))

    // Generate document hash for integrity check
    const documentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(documentData))
      .digest('hex')

    return NextResponse.json({
      success: true,
      document: documentData,
      documentHash,
      printHistory,
      isComplete: nocRequest.status === 'COMPLETED',
      canSign: determineCanSign(user.role, nocRequest.status),
    })
  } catch (error) {
    console.error('[Document] Error fetching document:', error)
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}

/**
 * Determine if user can sign at current stage
 */
function determineCanSign(userRole: string, status: string): boolean {
  const canSignMap: Record<string, string[]> = {
    PENDING_ESTABLISHMENT: ['ESTABLISHMENT_1', 'ESTABLISHMENT_2', 'ADMIN'],
    REPLY_JOINT_REGISTRAR: ['JOINT_REGISTRAR', 'ADMIN'],
    REPLY_REGISTRAR: ['REGISTRAR', 'ADMIN'],
  }
  return canSignMap[status]?.includes(userRole) || false
}
