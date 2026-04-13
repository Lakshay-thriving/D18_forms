import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const facultyMembers = await prisma.user.findMany({
      where: {
        role: 'FACULTY_MENTOR',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        contactNumber: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ faculty: facultyMembers })
  } catch (error) {
    console.error('Get faculty error:', error)
    return NextResponse.json(
      { error: 'Failed to get faculty members' },
      { status: 500 }
    )
  }
}
