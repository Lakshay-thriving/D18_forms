import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const approved = searchParams.get('approved') === 'true'

    let applications

    switch (user.role) {
      case 'APPLICANT':
        applications = await prisma.application.findMany({
          where: { applicantId: user.id },
          include: {
            documents: true,
            approvalActions: {
              include: { user: { select: { name: true, role: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
        break

      case 'FACULTY_MENTOR':
        // Faculty sees applications where they are the mentor
        if (approved) {
          applications = await prisma.application.findMany({
            where: {
              facultyMentorEmail: user.email,
              status: { in: ['FACULTY_APPROVED', 'HOD_APPROVED', 'HOD_REJECTED', 'JS_REVIEWED', 'JS_SENT_BACK', 'HOSTEL_ALLOCATED', 'AR_APPROVED', 'AR_REJECTED', 'CHIEF_WARDEN_APPROVED', 'CHIEF_WARDEN_REJECTED', 'COMPLETED'] },
            },
            include: {
              documents: true,
              approvalActions: {
                include: { user: { select: { name: true, role: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        } else {
          applications = await prisma.application.findMany({
            where: {
              facultyMentorEmail: user.email,
              status: 'SUBMITTED',
            },
            include: {
              documents: true,
              approvalActions: {
                include: { user: { select: { name: true, role: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        }
        break

      case 'HOD':
        // HOD sees faculty-approved applications from their department
        if (approved) {
          applications = await prisma.application.findMany({
            where: {
              approvalActions: {
                some: {
                  role: 'FACULTY_MENTOR',
                  action: 'APPROVED',
                  user: { department: user.department },
                },
              },
              status: { in: ['HOD_APPROVED', 'JS_REVIEWED', 'JS_SENT_BACK', 'HOSTEL_ALLOCATED', 'AR_APPROVED', 'AR_REJECTED', 'CHIEF_WARDEN_APPROVED', 'CHIEF_WARDEN_REJECTED', 'COMPLETED'] },
            },
            include: {
              documents: true,
              approvalActions: {
                include: { user: { select: { name: true, role: true, department: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        } else {
          applications = await prisma.application.findMany({
            where: {
              status: 'FACULTY_APPROVED',
              approvalActions: {
                some: {
                  role: 'FACULTY_MENTOR',
                  action: 'APPROVED',
                  user: { department: user.department },
                },
              },
            },
            include: {
              documents: true,
              approvalActions: {
                include: { user: { select: { name: true, role: true, department: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        }
        break

      case 'JUNIOR_SUPERINTENDENT':
        if (approved) {
          applications = await prisma.application.findMany({
            where: {
              status: { in: ['HOSTEL_ALLOCATED', 'AR_APPROVED', 'AR_REJECTED', 'CHIEF_WARDEN_APPROVED', 'CHIEF_WARDEN_REJECTED', 'COMPLETED'] },
            },
            include: {
              documents: true,
              approvalActions: {
                include: { user: { select: { name: true, role: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        } else {
          applications = await prisma.application.findMany({
            where: {
              status: 'HOD_APPROVED',
            },
            include: {
              documents: true,
              approvalActions: {
                include: { user: { select: { name: true, role: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        }
        break

      case 'ASSISTANT_REGISTRAR':
        if (approved) {
          applications = await prisma.application.findMany({
            where: {
              status: { in: ['AR_APPROVED', 'CHIEF_WARDEN_APPROVED', 'CHIEF_WARDEN_REJECTED', 'COMPLETED'] },
            },
            include: {
              documents: true,
              approvalActions: {
                include: { user: { select: { name: true, role: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        } else {
          applications = await prisma.application.findMany({
            where: {
              status: 'HOSTEL_ALLOCATED',
            },
            include: {
              documents: true,
              approvalActions: {
                include: { user: { select: { name: true, role: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        }
        break

      case 'CHIEF_WARDEN':
        if (approved) {
          applications = await prisma.application.findMany({
            where: {
              status: { in: ['CHIEF_WARDEN_APPROVED', 'COMPLETED'] },
            },
            include: {
              documents: true,
              approvalActions: {
                include: { user: { select: { name: true, role: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        } else {
          applications = await prisma.application.findMany({
            where: {
              status: 'AR_APPROVED',
            },
            include: {
              documents: true,
              approvalActions: {
                include: { user: { select: { name: true, role: true } } },
                orderBy: { createdAt: 'asc' },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid role' }, { status: 403 })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Failed to get applications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'APPLICANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    const requiredFields = [
      'applicantName', 'gender', 'affiliation', 'fullAddress',
      'contactNumber', 'applicantEmail', 'facultyMentorName',
      'facultyMentorEmail', 'facultyMentorContact', 'internshipStartDate',
      'internshipEndDate', 'arrivalDate', 'departureDate', 'hostelCategory'
    ]

    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Find faculty mentor by email to get their ID
    const facultyMentor = await prisma.user.findUnique({
      where: { email: data.facultyMentorEmail },
    })

    const application = await prisma.application.create({
      data: {
        applicantId: user.id,
        applicantName: data.applicantName,
        gender: data.gender,
        affiliation: data.affiliation,
        fullAddress: data.fullAddress,
        contactNumber: data.contactNumber,
        applicantEmail: data.applicantEmail,
        facultyMentorName: data.facultyMentorName,
        facultyMentorEmail: data.facultyMentorEmail,
        facultyMentorContact: data.facultyMentorContact,
        facultyMentorId: facultyMentor?.id,
        internshipStartDate: new Date(data.internshipStartDate),
        internshipEndDate: new Date(data.internshipEndDate),
        arrivalDate: new Date(data.arrivalDate),
        departureDate: new Date(data.departureDate),
        financialSupport: data.financialSupport || 0,
        hostelCategory: data.hostelCategory,
        remarks: data.remarks,
        declarationAccepted: data.declarationAccepted || false,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Create application error:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}
