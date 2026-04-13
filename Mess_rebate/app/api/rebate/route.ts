import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { calculateTotalDays, calculateTotalMeals, getCurrentSemester } from '@/lib/validations'
import { REBATE_RULES } from '@/lib/types'
import type { RebateType } from '@/lib/types'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let requests

    if (user.role === 'STUDENT') {
      requests = await prisma.rebateRequest.findMany({
        where: { studentId: user.id },
        include: {
          student: {
            select: { name: true, entryNumber: true, hostelName: true, messName: true },
          },
          approvals: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (user.role === 'MESS_MANAGER') {
      requests = await prisma.rebateRequest.findMany({
        where: {
          status: { in: ['SUBMITTED'] },
        },
        include: {
          student: {
            select: { name: true, entryNumber: true, hostelName: true, messName: true },
          },
          approvals: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (user.role === 'CARETAKER') {
      requests = await prisma.rebateRequest.findMany({
        where: {
          status: { in: ['SUBMITTED', 'MESS_MANAGER_APPROVED'] },
        },
        include: {
          student: {
            select: { name: true, entryNumber: true, hostelName: true, messName: true },
          },
          approvals: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (user.role === 'JUNIOR_SUPERINTENDENT') {
      requests = await prisma.rebateRequest.findMany({
        where: {
          status: { in: ['CARETAKER_APPROVED'] },
        },
        include: {
          student: {
            select: { name: true, entryNumber: true, hostelName: true, messName: true },
          },
          approvals: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      requests = await prisma.rebateRequest.findMany({
        include: {
          student: {
            select: { name: true, entryNumber: true, hostelName: true, messName: true },
          },
          approvals: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const rebateType = formData.get('rebateType') as RebateType
    const fromDate = new Date(formData.get('fromDate') as string)
    const toDate = new Date(formData.get('toDate') as string)
    const declarationAccepted = formData.get('declarationAccepted') === 'true'

    // Validate dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const minFromDate = new Date(today)
    minFromDate.setDate(minFromDate.getDate() + REBATE_RULES.MIN_ADVANCE_DAYS)

    if (fromDate < minFromDate) {
      return NextResponse.json(
        { error: `Must apply at least ${REBATE_RULES.MIN_ADVANCE_DAYS} day(s) in advance` },
        { status: 400 }
      )
    }

    const totalDays = calculateTotalDays(fromDate, toDate)
    const totalMeals = calculateTotalMeals(totalDays)

    if (totalDays < REBATE_RULES.MIN_DAYS) {
      return NextResponse.json(
        { error: `Minimum ${REBATE_RULES.MIN_DAYS} days required for rebate` },
        { status: 400 }
      )
    }

    // Check semester limit
    const currentSemester = getCurrentSemester()
    const semesterTracker = await prisma.semesterRebateTracker.findUnique({
      where: {
        studentId_semester: {
          studentId: user.id,
          semester: currentSemester,
        },
      },
    })

    const usedDays = semesterTracker?.totalDaysUsed || 0
    if (usedDays + totalDays > REBATE_RULES.MAX_DAYS_PER_SEMESTER) {
      return NextResponse.json(
        { error: `Exceeds semester limit. You have ${REBATE_RULES.MAX_DAYS_PER_SEMESTER - usedDays} days remaining.` },
        { status: 400 }
      )
    }

    // Handle document upload (in production, upload to storage)
    let documentUrl: string | undefined
    const document = formData.get('document') as File | null
    if (document) {
      // In production, upload to cloud storage
      documentUrl = `/uploads/${document.name}`
    }

    // Create rebate request
    const rebateRequest = await prisma.rebateRequest.create({
      data: {
        studentId: user.id,
        rebateType,
        fromDate,
        toDate,
        totalDays,
        totalMeals,
        status: 'SUBMITTED',
        documentUrl,
        declarationAccepted,
        submittedAt: new Date(),
      },
    })

    // Update semester tracker
    await prisma.semesterRebateTracker.upsert({
      where: {
        studentId_semester: {
          studentId: user.id,
          semester: currentSemester,
        },
      },
      update: {
        totalDaysUsed: { increment: totalDays },
      },
      create: {
        studentId: user.id,
        semester: currentSemester,
        totalDaysUsed: totalDays,
      },
    })

    return NextResponse.json(rebateRequest)
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}
