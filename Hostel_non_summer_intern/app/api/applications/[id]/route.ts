import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        documents: true,
        applicant: {
          select: { id: true, name: true, email: true },
        },
        approvalActions: {
          include: {
            user: {
              select: { name: true, role: true, department: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      { error: 'Failed to get application' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    const application = await prisma.application.findUnique({
      where: { id },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Only applicant can update their own draft application
    if (user.role === 'APPLICANT') {
      if (application.applicantId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
      if (application.status !== 'DRAFT' && application.status !== 'JS_SENT_BACK') {
        return NextResponse.json(
          { error: 'Cannot update submitted application' },
          { status: 400 }
        )
      }
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        ...data,
        internshipStartDate: data.internshipStartDate ? new Date(data.internshipStartDate) : undefined,
        internshipEndDate: data.internshipEndDate ? new Date(data.internshipEndDate) : undefined,
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : undefined,
        departureDate: data.departureDate ? new Date(data.departureDate) : undefined,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ application: updatedApplication })
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}
