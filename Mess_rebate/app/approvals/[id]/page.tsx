import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Header } from '@/components/header'
import { ApprovalForm } from '@/components/approval-form'
import type { RequestStatus } from '@/lib/types'

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role === 'STUDENT') {
    redirect('/dashboard')
  }

  const request = await prisma.rebateRequest.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          name: true,
          entryNumber: true,
          course: true,
          hostelName: true,
          roomNumber: true,
          messName: true,
        },
      },
      approvals: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!request) {
    notFound()
  }

  // Check if user can take action on this request
  let canTakeAction = false
  if (user.role === 'MESS_MANAGER' && request.status === 'SUBMITTED') {
    canTakeAction = true
  } else if (
    user.role === 'CARETAKER' &&
    ['SUBMITTED', 'MESS_MANAGER_APPROVED'].includes(request.status)
  ) {
    canTakeAction = true
  } else if (
    user.role === 'JUNIOR_SUPERINTENDENT' &&
    request.status === 'CARETAKER_APPROVED'
  ) {
    canTakeAction = true
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <ApprovalForm
          request={{
            ...request,
            status: request.status as RequestStatus,
          }}
          userRole={user.role}
          canTakeAction={canTakeAction}
        />
      </main>
    </div>
  )
}
