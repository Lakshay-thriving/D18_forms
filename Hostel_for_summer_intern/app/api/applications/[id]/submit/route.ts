import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'APPLICANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const application = await prisma.application.findUnique({
      where: { id },
      include: { documents: true },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.applicantId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (application.status !== 'DRAFT' && application.status !== 'JS_SENT_BACK') {
      return NextResponse.json(
        { error: 'Application already submitted' },
        { status: 400 }
      )
    }

    if (!application.declarationAccepted) {
      return NextResponse.json(
        { error: 'Declaration must be accepted' },
        { status: 400 }
      )
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ application: updatedApplication })
  } catch (error) {
    console.error('Submit application error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
