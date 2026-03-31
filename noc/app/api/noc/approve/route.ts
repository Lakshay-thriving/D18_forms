import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/auth'
import { sendNOCCompletionEmail, sendNOCStatusUpdateEmail } from '@/lib/email'
import { z } from 'zod'
import crypto from 'crypto'

// Generate SHA-256 hash for signature verification
function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

// Generate document hash for integrity verification
function generateDocumentHash(nocRequest: any): string {
  const documentData = {
    requestId: nocRequest.requestId,
    applicantId: nocRequest.applicantId,
    purpose: nocRequest.purpose,
    certificateType: nocRequest.certificateType,
    applicantType: nocRequest.applicantType,
    passportType: nocRequest.passportType,
    designation: nocRequest.designation,
    department: nocRequest.department,
    status: nocRequest.status,
  }
  return crypto.createHash('sha256').update(JSON.stringify(documentData)).digest('hex')
}

const approveSchema = z.object({
  requestId: z.string(),
  action: z.enum(['approve', 'reject']),
  comments: z.string().optional(),
  signatureData: z.string().optional(), // Base64 signature for reply workflow
})

/**
 * WORKFLOW STAGES:
 * 
 * FORWARD WORKFLOW (verification):
 * 1. SUBMITTED/PENDING_REGISTRAR → Registrar reviews → PENDING_JOINT_REGISTRAR
 * 2. PENDING_JOINT_REGISTRAR → Joint Registrar reviews → PENDING_ESTABLISHMENT  
 * 3. PENDING_ESTABLISHMENT → Establishment verifies → starts REPLY workflow
 * 
 * REPLY WORKFLOW (signatures going backward):
 * For PASSPORT NOC:
 *   4. Establishment signs → REPLY_JOINT_REGISTRAR
 *   5. Joint Registrar signs → REPLY_REGISTRAR
 *   6. Registrar signs → COMPLETED (sent to applicant)
 * 
 * For NON-PASSPORT NOC:
 *   4. Establishment signs → REPLY_JOINT_REGISTRAR
 *   5. Joint Registrar signs → COMPLETED (sent directly to applicant, skips Registrar)
 */

// Forward workflow progression
const forwardWorkflow: Record<string, { nextStatus: string; nextRole: string | null }> = {
  REGISTRAR: {
    nextStatus: 'PENDING_JOINT_REGISTRAR',
    nextRole: 'JOINT_REGISTRAR',
  },
  JOINT_REGISTRAR: {
    nextStatus: 'PENDING_ESTABLISHMENT',
    nextRole: null, // Determined by applicant type
  },
}

// Reply workflow progression (after establishment approves)
const replyWorkflowPassport: Record<string, { nextStatus: string; currentSigner: string }> = {
  PENDING_ESTABLISHMENT: { nextStatus: 'REPLY_JOINT_REGISTRAR', currentSigner: 'ESTABLISHMENT' },
  REPLY_JOINT_REGISTRAR: { nextStatus: 'REPLY_REGISTRAR', currentSigner: 'JOINT_REGISTRAR' },
  REPLY_REGISTRAR: { nextStatus: 'COMPLETED', currentSigner: 'REGISTRAR' },
}

const replyWorkflowNonPassport: Record<string, { nextStatus: string; currentSigner: string }> = {
  PENDING_ESTABLISHMENT: { nextStatus: 'REPLY_JOINT_REGISTRAR', currentSigner: 'ESTABLISHMENT' },
  REPLY_JOINT_REGISTRAR: { nextStatus: 'COMPLETED', currentSigner: 'JOINT_REGISTRAR' },
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const { requestId, action, comments, signatureData } = approveSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const approvalRoles = ['REGISTRAR', 'JOINT_REGISTRAR', 'ESTABLISHMENT_1', 'ESTABLISHMENT_2', 'ADMIN']
    if (!approvalRoles.includes(user.role)) {
      return NextResponse.json({ error: 'You do not have approval rights' }, { status: 403 })
    }

    const nocRequest = await prisma.nOCRequest.findUnique({
      where: { requestId },
      include: { applicant: true, signatures: true },
    })

    if (!nocRequest) {
      return NextResponse.json({ error: 'NOC request not found' }, { status: 404 })
    }

    // Determine if we're in forward or reply workflow
    const isReplyStage = ['REPLY_JOINT_REGISTRAR', 'REPLY_REGISTRAR'].includes(nocRequest.status)
    const isEstablishmentApproval = nocRequest.status === 'PENDING_ESTABLISHMENT'

    // === REJECTION HANDLING ===
    if (action === 'reject') {
      await prisma.nOCRequest.update({
        where: { requestId },
        data: { status: 'REJECTED', currentStage: null },
      })

      // Update existing pending approval or create new one
      const existingPending = await prisma.nOCApproval.findFirst({
        where: {
          requestId: nocRequest.id,
          approverRole: user.role,
          status: 'pending',
        },
      })

      if (existingPending) {
        await prisma.nOCApproval.update({
          where: { id: existingPending.id },
          data: {
            approverId: user.id,
            status: 'rejected',
            comments,
            rejectedAt: new Date(),
          },
        })
      } else {
        await prisma.nOCApproval.create({
          data: {
            requestId: nocRequest.id,
            approverRole: user.role,
            approverId: user.id,
            status: 'rejected',
            comments,
            rejectedAt: new Date(),
          },
        })
      }

      await createAuditLog('NOC_REQUEST_REJECTED', 'NOCRequest', nocRequest.id, user.id, { requestId, role: user.role, comments })

      // Send rejection email to applicant
      await sendNOCStatusUpdateEmail(
        nocRequest.applicant.email,
        nocRequest.requestId,
        'REJECTED',
        user.role,
        true,
        comments
      )

      return NextResponse.json({ success: true, message: 'Request rejected' })
    }

    // === FORWARD WORKFLOW (Verification stage) ===
    if (!isReplyStage && !isEstablishmentApproval) {
      // Verify correct stage
      const expectedStatuses: Record<string, string[]> = {
        REGISTRAR: ['SUBMITTED', 'PENDING_REGISTRAR'],
        JOINT_REGISTRAR: ['PENDING_JOINT_REGISTRAR'],
        ADMIN: ['SUBMITTED', 'PENDING_REGISTRAR', 'PENDING_JOINT_REGISTRAR'],
      }

      if (!expectedStatuses[user.role]?.includes(nocRequest.status)) {
        return NextResponse.json({ error: 'This request is not at your workflow stage' }, { status: 400 })
      }

      const progression = forwardWorkflow[user.role]
      let nextStatus = progression?.nextStatus || 'PENDING_ESTABLISHMENT'
      let nextRole = progression?.nextRole

      // For Joint Registrar, determine establishment based on applicant type
      if (user.role === 'JOINT_REGISTRAR') {
        nextRole = nocRequest.applicantType === 'FACULTY' ? 'ESTABLISHMENT_1' : 'ESTABLISHMENT_2'
      }

      await prisma.nOCRequest.update({
        where: { requestId },
        data: { status: nextStatus, currentStage: nextStatus },
      })

      // Update existing pending approval or create new one
      const existingPendingForward = await prisma.nOCApproval.findFirst({
        where: {
          requestId: nocRequest.id,
          approverRole: user.role,
          status: 'pending',
        },
      })

      if (existingPendingForward) {
        await prisma.nOCApproval.update({
          where: { id: existingPendingForward.id },
          data: {
            approverId: user.id,
            status: 'approved',
            comments,
            approvedAt: new Date(),
          },
        })
      } else {
        await prisma.nOCApproval.create({
          data: {
            requestId: nocRequest.id,
            approverRole: user.role,
            approverId: user.id,
            status: 'approved',
            comments,
            approvedAt: new Date(),
          },
        })
      }

      await createAuditLog('NOC_FORWARD_APPROVED', 'NOCRequest', nocRequest.id, user.id, { requestId, role: user.role, nextStatus })

      return NextResponse.json({
        success: true,
        message: `Request forwarded to ${nextRole || 'next stage'}`,
        newStatus: nextStatus,
      })
    }

    // === ESTABLISHMENT APPROVAL (Start of Reply Workflow) ===
    if (isEstablishmentApproval) {
      // Verify establishment type matches applicant type
      if (user.role === 'ESTABLISHMENT_1' && nocRequest.applicantType !== 'FACULTY') {
        return NextResponse.json({ error: 'Faculty establishment cannot process staff requests' }, { status: 403 })
      }
      if (user.role === 'ESTABLISHMENT_2' && nocRequest.applicantType !== 'STAFF') {
        return NextResponse.json({ error: 'Staff establishment cannot process faculty requests' }, { status: 403 })
      }

      // Require signature for reply workflow
      if (!signatureData) {
        return NextResponse.json({ error: 'Digital signature is required to approve at this stage' }, { status: 400 })
      }

      // Save digital signature with verification hash
      const signatureHash = generateHash(signatureData)
      const documentHash = generateDocumentHash(nocRequest)
      
      await prisma.digitalSignature.create({
        data: {
          requestId: nocRequest.id,
          signerId: user.id,
          signatureData,
          signatureHash,
          documentHash,
          stage: 'ESTABLISHMENT',
          signerRole: user.role,
          signerEmail: user.email,
        },
      })

      // Move to reply workflow
      const nextStatus = 'REPLY_JOINT_REGISTRAR'
      await prisma.nOCRequest.update({
        where: { requestId },
        data: { status: nextStatus, currentStage: nextStatus },
      })

      // Update existing pending approval or create new one (establishment stage)
      const existingPendingEst = await prisma.nOCApproval.findFirst({
        where: {
          requestId: nocRequest.id,
          approverRole: user.role,
          status: 'pending',
        },
      })

      if (existingPendingEst) {
        await prisma.nOCApproval.update({
          where: { id: existingPendingEst.id },
          data: {
            approverId: user.id,
            status: 'signed',
            comments,
            approvedAt: new Date(),
          },
        })
      } else {
        await prisma.nOCApproval.create({
          data: {
            requestId: nocRequest.id,
            approverRole: user.role,
            approverId: user.id,
            status: 'signed',
            comments,
            approvedAt: new Date(),
          },
        })
      }

      await createAuditLog('NOC_ESTABLISHMENT_SIGNED', 'NOCRequest', nocRequest.id, user.id, { requestId, passportType: nocRequest.passportType })

      return NextResponse.json({
        success: true,
        message: 'Request signed and forwarded to Joint Registrar for counter-signature',
        newStatus: nextStatus,
        isReplyStage: true,
      })
    }

    // === REPLY WORKFLOW (Signature stages going backward) ===
    if (isReplyStage) {
      const replyWorkflow = nocRequest.passportType === 'PASSPORT' ? replyWorkflowPassport : replyWorkflowNonPassport

      // Verify correct signer for this stage
      const expectedRoles: Record<string, string[]> = {
        REPLY_JOINT_REGISTRAR: ['JOINT_REGISTRAR', 'ADMIN'],
        REPLY_REGISTRAR: ['REGISTRAR', 'ADMIN'],
      }

      if (!expectedRoles[nocRequest.status]?.includes(user.role)) {
        return NextResponse.json({ error: 'You are not authorized to sign at this stage' }, { status: 403 })
      }

      // Require signature
      if (!signatureData) {
        return NextResponse.json({ error: 'Digital signature is required' }, { status: 400 })
      }

      // Determine signer stage name
      let signerStage = 'JOINT_REGISTRAR'
      if (nocRequest.status === 'REPLY_REGISTRAR') signerStage = 'REGISTRAR'

      // Save digital signature with verification hash
      const signatureHash = generateHash(signatureData)
      const documentHash = generateDocumentHash(nocRequest)
      
      await prisma.digitalSignature.create({
        data: {
          requestId: nocRequest.id,
          signerId: user.id,
          signatureData,
          signatureHash,
          documentHash,
          stage: signerStage,
          signerRole: user.role,
          signerEmail: user.email,
        },
      })

      // Get next status
      const currentStageConfig = replyWorkflow[nocRequest.status]
      const nextStatus = currentStageConfig?.nextStatus || 'COMPLETED'

      await prisma.nOCRequest.update({
        where: { requestId },
        data: { 
          status: nextStatus, 
          currentStage: nextStatus === 'COMPLETED' ? null : nextStatus,
        },
      })

      // Update existing pending approval or create new one (reply workflow)
      const existingPendingReply = await prisma.nOCApproval.findFirst({
        where: {
          requestId: nocRequest.id,
          approverRole: user.role,
          status: 'pending',
        },
      })

      if (existingPendingReply) {
        await prisma.nOCApproval.update({
          where: { id: existingPendingReply.id },
          data: {
            approverId: user.id,
            status: 'signed',
            comments,
            approvedAt: new Date(),
          },
        })
      } else {
        await prisma.nOCApproval.create({
          data: {
            requestId: nocRequest.id,
            approverRole: user.role,
            approverId: user.id,
            status: 'signed',
            comments,
            approvedAt: new Date(),
          },
        })
      }

      await createAuditLog('NOC_REPLY_SIGNED', 'NOCRequest', nocRequest.id, user.id, { requestId, stage: nocRequest.status, nextStatus })

      if (nextStatus === 'COMPLETED') {
        // Send completion email to applicant
        await sendNOCCompletionEmail(
          nocRequest.applicant.email,
          nocRequest.requestId
        )

        return NextResponse.json({
          success: true,
          message: 'NOC completed! All signatures collected. Document sent to applicant.',
          newStatus: nextStatus,
          isComplete: true,
        })
      }

      const nextSigner = nextStatus === 'REPLY_REGISTRAR' ? 'Registrar' : 'Applicant'
      return NextResponse.json({
        success: true,
        message: `Signed and forwarded to ${nextSigner}`,
        newStatus: nextStatus,
        isReplyStage: true,
      })
    }

    return NextResponse.json({ error: 'Invalid workflow state' }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }
    console.error('[Workflow] Error processing approval:', error)
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 })
  }
}
