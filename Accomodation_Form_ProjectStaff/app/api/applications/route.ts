import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendApplicationConfirmationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form fields
    const applicantName = formData.get('applicantName') as string
    const gender = formData.get('gender') as 'MALE' | 'FEMALE'
    const department = formData.get('department') as string
    const fullAddress = formData.get('fullAddress') as string
    const contactNumber = formData.get('contactNumber') as string
    const emailId = formData.get('emailId') as string
    const facultySupervisorName = formData.get('facultySupervisorName') as string
    const facultyEmail = formData.get('facultyEmail') as string
    const facultyContactNumber = formData.get('facultyContactNumber') as string
    const periodOfStayFrom = new Date(formData.get('periodOfStayFrom') as string)
    const periodOfStayTo = new Date(formData.get('periodOfStayTo') as string)
    const dateOfArrival = new Date(formData.get('dateOfArrival') as string)
    const dateOfDeparture = new Date(formData.get('dateOfDeparture') as string)
    const hostelRentCategory = formData.get('hostelRentCategory') as 'CATEGORY_A' | 'CATEGORY_B'
    const remarks = formData.get('remarks') as string | null
    const applicantSignature = formData.get('applicantSignature') as string

    // Handle file uploads (in production, you'd upload to cloud storage)
    // For now, we'll store placeholder URLs
    const offerLetter = formData.get('offerLetter') as File
    const idProof = formData.get('idProof') as File

    // Validate required fields
    if (!applicantName || !gender || !department || !fullAddress || 
        !contactNumber || !emailId || !facultySupervisorName || 
        !facultyEmail || !facultyContactNumber || !periodOfStayFrom || 
        !periodOfStayTo || !dateOfArrival || !dateOfDeparture || 
        !hostelRentCategory || !applicantSignature || !offerLetter || !idProof) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate faculty supervisor exists and belongs to the same department
    const facultySupervisor = await prisma.user.findUnique({
      where: { email: facultyEmail.toLowerCase() },
    })

    if (!facultySupervisor) {
      return NextResponse.json(
        { error: `Faculty supervisor with email ${facultyEmail} not found in the system` },
        { status: 400 }
      )
    }

    if (facultySupervisor.role !== 'FACULTY_SUPERVISOR') {
      return NextResponse.json(
        { error: `User ${facultyEmail} is not a Faculty Supervisor` },
        { status: 400 }
      )
    }

    if (facultySupervisor.department !== department) {
      return NextResponse.json(
        { error: `Faculty supervisor's department (${facultySupervisor.department}) does not match applicant's department (${department})` },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        applicantName,
        gender,
        department,
        fullAddress,
        contactNumber,
        emailId,
        facultySupervisorName,
        facultyEmail,
        facultyContactNumber,
        periodOfStayFrom,
        periodOfStayTo,
        dateOfArrival,
        dateOfDeparture,
        hostelRentCategory,
        remarks: remarks || null,
        applicantSignature,
        offerLetterUrl: `/uploads/${offerLetter.name}`, // Placeholder
        idProofUrl: `/uploads/${idProof.name}`, // Placeholder
        status: 'PENDING_FACULTY_APPROVAL',
      },
    })

    // Send confirmation email to applicant
    const emailSent = await sendApplicationConfirmationEmail(
      emailId,
      applicantName,
      application.id
    )

    if (!emailSent) {
      console.warn(`[Applications] Email confirmation not sent for application ${application.id}`)
    }

    return NextResponse.json({ id: application.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
