import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { sendApplicationStatusEmail, sendRejectionEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { action, remarks, signature, allocatedHostel, allocatedRoom } = await request.json()

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: true,
        approvalActions: {
          include: { user: true },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    let newStatus = application.status
    let canApprove = false

    // Check role-based permissions and determine new status
    switch (user.role) {
      case 'FACULTY_MENTOR':
        if (application.status === 'SUBMITTED' && application.facultyMentorEmail === user.email) {
          canApprove = true
          newStatus = action === 'APPROVED' ? 'FACULTY_APPROVED' : 'FACULTY_REJECTED'
        }
        break

      case 'HOD':
        if (application.status === 'FACULTY_APPROVED') {
          // Check if faculty who approved is from same department
          const facultyApproval = application.approvalActions.find(
            a => a.role === 'FACULTY_MENTOR' && a.action === 'APPROVED'
          )
          if (facultyApproval && facultyApproval.user.department === user.department) {
            canApprove = true
            newStatus = action === 'APPROVED' ? 'HOD_APPROVED' : 'HOD_REJECTED'
          }
        }
        break

      case 'JUNIOR_SUPERINTENDENT':
        if (application.status === 'HOD_APPROVED') {
          canApprove = true
          if (action === 'SENT_BACK') {
            newStatus = 'JS_SENT_BACK'
          } else if (action === 'ALLOCATED') {
            newStatus = 'HOSTEL_ALLOCATED'
          }
        }
        break

      case 'ASSISTANT_REGISTRAR':
        if (application.status === 'HOSTEL_ALLOCATED') {
          canApprove = true
          newStatus = action === 'APPROVED' ? 'AR_APPROVED' : 'AR_REJECTED'
        }
        break

      case 'CHIEF_WARDEN':
        if (application.status === 'AR_APPROVED') {
          canApprove = true
          newStatus = action === 'APPROVED' ? 'CHIEF_WARDEN_APPROVED' : 'CHIEF_WARDEN_REJECTED'
          if (action === 'APPROVED') {
            newStatus = 'COMPLETED'
          }
        }
        break
    }

    if (!canApprove) {
      return NextResponse.json(
        { error: 'You are not authorized to perform this action' },
        { status: 403 }
      )
    }

    // Create approval action
    await prisma.approvalAction.create({
      data: {
        applicationId: id,
        userId: user.id,
        role: user.role,
        action,
        remarks,
        signature,
        allocatedHostel,
        allocatedRoom,
      },
    })

    // Update application
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updatedAt: new Date(),
    }

    if (allocatedHostel) {
      updateData.allocatedHostel = allocatedHostel
    }
    if (allocatedRoom) {
      updateData.allocatedRoom = allocatedRoom
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: updateData,
    })

    // Send email notifications for rejections
    if (action === 'REJECTED') {
      const roleNames: Record<string, string> = {
        FACULTY_MENTOR: 'Faculty Mentor',
        HOD: 'Head of Department',
        JUNIOR_SUPERINTENDENT: 'Junior Superintendent',
        ASSISTANT_REGISTRAR: 'Assistant Registrar',
        CHIEF_WARDEN: 'Chief Warden',
      }
      
      try {
        await sendRejectionEmail(
          application.applicantEmail,
          application.applicantName,
          roleNames[user.role] || user.role,
          remarks
        )
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError)
      }
    }

    // Send final approval email
    if (newStatus === 'COMPLETED') {
      try {
        await sendApplicationStatusEmail(
          application.applicantEmail,
          application.applicantName,
          'approved',
          undefined,
          {
            hostel: updatedApplication.allocatedHostel || 'TBD',
            room: updatedApplication.allocatedRoom || undefined,
          }
        )
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError)
      }
    }

    return NextResponse.json({ application: updatedApplication })
  } catch (error) {
    console.error('Approval error:', error)
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}
