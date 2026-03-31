import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendApplicationApprovalEmail, sendApplicationRejectionEmail } from '@/lib/email'

type ApprovalRole = 'FACULTY_SUPERVISOR' | 'HOD' | 'JUNIOR_SUPERINTENDENT' | 'ASSISTANT_REGISTRAR' | 'CHIEF_WARDEN'
type ApprovalAction = 'APPROVED' | 'REJECTED' | 'RECOMMENDED' | 'SENT_BACK' | 'PROCEED_TO_ALLOCATION'
type Hostel = 'BRAHMAPUTRA_BOYS' | 'CHENAB' | 'BEAS' | 'SATLUJ' | 'BRAHMAPUTRA_GIRLS' | 'RAAVI'

interface ApproveRequestBody {
  role: ApprovalRole
  action: ApprovalAction
  remarks?: string | null
  signature: string
  hostel?: Hostel
  roomNumber?: string
}

// Define valid transitions for each role
const roleTransitions: Record<ApprovalRole, Record<ApprovalAction, string | null>> = {
  FACULTY_SUPERVISOR: {
    APPROVED: 'PENDING_HOD_RECOMMENDATION',
    REJECTED: 'REJECTED',
    RECOMMENDED: null,
    SENT_BACK: null,
    PROCEED_TO_ALLOCATION: null,
  },
  HOD: {
    RECOMMENDED: 'PENDING_HOSTEL_REVIEW',
    REJECTED: 'REJECTED',
    APPROVED: null,
    SENT_BACK: null,
    PROCEED_TO_ALLOCATION: null,
  },
  JUNIOR_SUPERINTENDENT: {
    SENT_BACK: 'SENT_BACK_TO_APPLICANT',
    PROCEED_TO_ALLOCATION: 'PENDING_AR_APPROVAL',
    APPROVED: null,
    REJECTED: null,
    RECOMMENDED: null,
  },
  ASSISTANT_REGISTRAR: {
    APPROVED: 'PENDING_CHIEF_WARDEN_APPROVAL',
    REJECTED: 'REJECTED',
    RECOMMENDED: null,
    SENT_BACK: null,
    PROCEED_TO_ALLOCATION: null,
  },
  CHIEF_WARDEN: {
    APPROVED: 'COMPLETED',
    REJECTED: 'REJECTED',
    RECOMMENDED: null,
    SENT_BACK: null,
    PROCEED_TO_ALLOCATION: null,
  },
}

// Define required current status for each role
const requiredStatus: Record<ApprovalRole, string[]> = {
  FACULTY_SUPERVISOR: ['PENDING_FACULTY_APPROVAL'],
  HOD: ['PENDING_HOD_RECOMMENDATION'],
  JUNIOR_SUPERINTENDENT: ['PENDING_HOSTEL_REVIEW', 'PENDING_ALLOCATION'],
  ASSISTANT_REGISTRAR: ['PENDING_AR_APPROVAL'],
  CHIEF_WARDEN: ['PENDING_CHIEF_WARDEN_APPROVAL'],
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: ApproveRequestBody = await request.json()
    const { role, action, remarks, signature, hostel, roomNumber } = body

    // Validate required fields
    if (!role || !action || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: role, action, or signature' },
        { status: 400 }
      )
    }

    // Get the application
    const application = await prisma.application.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Check if current status allows this role to act
    const allowedStatuses = requiredStatus[role]
    if (!allowedStatuses?.includes(application.status)) {
      return NextResponse.json(
        { error: `Cannot perform this action. Current status: ${application.status}` },
        { status: 400 }
      )
    }

    // Get the next status
    const nextStatus = roleTransitions[role]?.[action]
    if (nextStatus === null || nextStatus === undefined) {
      return NextResponse.json(
        { error: `Invalid action '${action}' for role '${role}'` },
        { status: 400 }
      )
    }

    // Validate HOD exists for the department when Faculty approves
    if (role === 'FACULTY_SUPERVISOR' && action === 'APPROVED') {
      const hod = await prisma.user.findFirst({
        where: {
          role: 'HOD',
          department: {
            equals: application.department,
            mode: 'insensitive',
          },
        },
      })

      if (!hod) {
        return NextResponse.json(
          { error: `No HOD found for ${application.department} department. Application cannot proceed.` },
          { status: 400 }
        )
      }
    }

    // Special handling for Junior Superintendent allocation
    let updateData: Record<string, unknown> = { status: nextStatus }
    if (role === 'JUNIOR_SUPERINTENDENT' && action === 'PROCEED_TO_ALLOCATION') {
      if (application.status === 'PENDING_HOSTEL_REVIEW') {
        // First stage: just proceed to allocation
        updateData = { status: 'PENDING_ALLOCATION' }
      } else if (application.status === 'PENDING_ALLOCATION') {
        // Second stage: allocate hostel and proceed to AR
        if (!hostel) {
          return NextResponse.json(
            { error: 'Hostel selection is required for allocation' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'PENDING_AR_APPROVAL',
          allocatedHostel: hostel,
          allocatedRoomNumber: roomNumber || null,
        }
      }
    }

    // Create approval record and update application in a transaction
    const updatedApplication = await prisma.$transaction(async (tx) => {
      await tx.approval.create({
        data: {
          applicationId: id,
          role,
          action,
          remarks: remarks || null,
          signature,
        },
      })

      return await tx.application.update({
        where: { id },
        data: updateData,
      })
    })

    // Send email notifications based on action
    if (action === 'REJECTED') {
      // Send rejection email to applicant
      await sendApplicationRejectionEmail(
        application.emailId,
        application.applicantName,
        application.id,
        remarks || 'Your application has been rejected.',
        role
      )
    } else if (action === 'APPROVED' && updatedApplication.status === 'COMPLETED') {
      // Send approval email to applicant when Chief Warden approves (final approval)
      await sendApplicationApprovalEmail(
        application.emailId,
        application.applicantName,
        application.id,
        updatedApplication.allocatedHostel || undefined,
        updatedApplication.allocatedRoomNumber || undefined
      )
    }

    return NextResponse.json({ success: true, newStatus: updateData.status })
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}
