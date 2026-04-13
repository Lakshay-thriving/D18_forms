import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getCurrentSemester } from '@/lib/validations'
import { REBATE_RULES } from '@/lib/types'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentSemester = getCurrentSemester()
    const tracker = await prisma.semesterRebateTracker.findUnique({
      where: {
        studentId_semester: {
          studentId: user.id,
          semester: currentSemester,
        },
      },
    })

    const usedDays = tracker?.totalDaysUsed || 0
    const remainingDays = REBATE_RULES.MAX_DAYS_PER_SEMESTER - usedDays

    return NextResponse.json({
      usedDays,
      remainingDays,
      maxDays: REBATE_RULES.MAX_DAYS_PER_SEMESTER,
      semester: currentSemester,
    })
  } catch (error) {
    console.error('Error fetching remaining days:', error)
    return NextResponse.json({ error: 'Failed to fetch remaining days' }, { status: 500 })
  }
}
