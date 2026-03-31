import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/session'
import { createAuditLog } from '@/lib/auth'
import { z } from 'zod'

const createNOCSchema = z.object({
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  certificateType: z.enum(['NO_OBJECTION', 'RESIDENCE_PROOF', 'OTHER']),
  applicantType: z.enum(['FACULTY', 'STAFF']),
  passportType: z.enum(['PASSPORT', 'NON_PASSPORT']),
  presentAddress: z.string().min(5, 'Present address must be at least 5 characters'),
  permanentAddress: z.string().optional(),
  designation: z.string().min(2, 'Designation must be at least 2 characters'),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  employeeCode: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    // Only applicants can create NOC requests
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    })

    if (user?.role !== 'APPLICANT') {
      return NextResponse.json(
        { error: 'Unauthorized. Only applicants can create NOC requests.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const formData = createNOCSchema.parse(body)

    // Generate unique request ID
    const requestId = `NOC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Create NOC request
    const nocRequest = await prisma.nOCRequest.create({
      data: {
        requestId,
        applicantId: session.userId,
        status: 'DRAFT',
        ...formData,
      },
    })

    // Create audit log
    await createAuditLog(
      'NOC_REQUEST_CREATED',
      'NOCRequest',
      nocRequest.id,
      session.userId,
      { requestId, certificateType: formData.certificateType }
    )

    return NextResponse.json({
      success: true,
      requestId: nocRequest.requestId,
      message: 'NOC request created successfully',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]?.message || 'Invalid form data'
      return NextResponse.json(
        { error: firstError, details: error.errors },
        { status: 400 }
      )
    }

    console.error('[NOC] Error creating request:', error)
    return NextResponse.json(
      { error: 'Failed to create NOC request' },
      { status: 500 }
    )
  }
}
