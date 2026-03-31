import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import type { RequestStatus } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { approved, remarks, confirmedMeals } = body

    const rebateRequest = await prisma.rebateRequest.findUnique({
      where: { id },
      include: { approvals: true },
    })

    if (!rebateRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    let newStatus: RequestStatus
    let approverRole = user.role

    // Determine new status based on role and action
    if (user.role === 'MESS_MANAGER') {
      if (rebateRequest.status !== 'SUBMITTED') {
        return NextResponse.json({ error: 'Invalid request status' }, { status: 400 })
      }
      newStatus = approved ? 'MESS_MANAGER_APPROVED' : 'MESS_MANAGER_REJECTED'
    } else if (user.role === 'CARETAKER') {
      if (!['SUBMITTED', 'MESS_MANAGER_APPROVED'].includes(rebateRequest.status)) {
        return NextResponse.json({ error: 'Invalid request status' }, { status: 400 })
      }
      
      if (!approved && body.sendBack) {
        newStatus = 'CARETAKER_SENT_BACK'
      } else {
        newStatus = approved ? 'CARETAKER_APPROVED' : 'CARETAKER_REJECTED'
      }
    } else if (user.role === 'JUNIOR_SUPERINTENDENT') {
      if (rebateRequest.status !== 'CARETAKER_APPROVED') {
        return NextResponse.json({ error: 'Invalid request status' }, { status: 400 })
      }
      newStatus = approved ? 'COMPLETED' : 'JS_REJECTED'
    } else {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 })
    }

    // Create approval record
    const approvalData: Record<string, unknown> = {
      requestId: id,
      approverRole,
      approverId: user.id,
      approved,
      remarks,
    }

    if (user.role === 'MESS_MANAGER') {
      approvalData.messManagerId = user.id
      if (confirmedMeals) {
        approvalData.confirmedMeals = confirmedMeals
      }
    } else if (user.role === 'CARETAKER') {
      approvalData.caretakerId = user.id
    } else if (user.role === 'JUNIOR_SUPERINTENDENT') {
      approvalData.juniorSuperintendentId = user.id
    }

    await prisma.approval.create({
      data: approvalData as Parameters<typeof prisma.approval.create>[0]['data'],
    })

    // Update request status
    await prisma.rebateRequest.update({
      where: { id },
      data: { status: newStatus },
    })

    return NextResponse.json({ success: true, newStatus })
  } catch (error) {
    console.error('Error processing approval:', error)
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 })
  }
}
