import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ApplicationList } from '@/components/application-list'

export const metadata = {
  title: 'HOD Dashboard - IIT Ropar Hostel',
}

export default async function HODDashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  if (user.role !== 'HOD') {
    redirect('/dashboard')
  }

  // Get applications from the HOD's department
  const applications = await prisma.application.findMany({
    where: {
      status: 'PENDING_HOD_RECOMMENDATION',
      ...(user.department && {
        department: {
          equals: user.department,
          mode: 'insensitive',
        },
      }),
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Head of Department Dashboard
          </h2>
          <p className="text-muted-foreground mt-2">
            Review and recommend hostel allocation applications
            {user.department && ` for ${user.department}`}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {applications.length} application(s) pending your recommendation
          </p>
        </div>

        <ApplicationList
          applications={applications}
          actionPath="/dashboard/hod/review"
          emptyMessage="No applications pending your recommendation"
        />
      </div>
    </main>
  )
}
