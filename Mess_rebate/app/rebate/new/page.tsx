import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Header } from '@/components/header'
import { RebateForm } from '@/components/rebate-form'
import { getCurrentSemester } from '@/lib/validations'
import { REBATE_RULES } from '@/lib/types'

export default async function NewRebatePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'STUDENT') {
    redirect('/dashboard')
  }

  // Get remaining days
  const currentSemester = getCurrentSemester()
  const tracker = await prisma.semesterRebateTracker.findUnique({
    where: {
      studentId_semester: {
        studentId: user.id,
        semester: currentSemester,
      },
    },
  })

  const remainingDays = REBATE_RULES.MAX_DAYS_PER_SEMESTER - (tracker?.totalDaysUsed || 0)

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">New Rebate Request</h1>
          <p className="text-muted-foreground">
            Fill out the form below to submit a mess rebate request
          </p>
        </div>

        <RebateForm user={user} remainingDays={remainingDays} />
      </main>
    </div>
  )
}
