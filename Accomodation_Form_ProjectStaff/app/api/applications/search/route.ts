import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const email = searchParams.get('email')

    if (!id && !email) {
      return NextResponse.json(
        { error: 'Please provide application ID or email' },
        { status: 400 }
      )
    }

    const whereClause: Record<string, string> = {}
    if (id) {
      whereClause.id = id
    }
    if (email) {
      whereClause.emailId = email
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        applicantName: true,
        emailId: true,
        department: true,
        status: true,
        createdAt: true,
        periodOfStayFrom: true,
        periodOfStayTo: true,
      },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error searching applications:', error)
    return NextResponse.json(
      { error: 'Failed to search applications' },
      { status: 500 }
    )
  }
}
