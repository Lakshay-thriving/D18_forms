import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ApplicationList } from '@/components/application-list'

export const metadata = {
  title: 'Chief Warden Dashboard - IIT Ropar Hostel',
}

export default async function ChiefWardenDashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  if (user.role !== 'CHIEF_WARDEN') {
    redirect('/dashboard')
  }

  const applications = await prisma.application.findMany({
    where: {
      status: 'PENDING_CHIEF_WARDEN_APPROVAL',
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
            Chief Warden Dashboard
          </h2>
          <p className="text-muted-foreground mt-2">
            Final approval for hostel allocations
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {applications.length} application(s) pending final approval
          </p>
        </div>

        <ApplicationList
          applications={applications}
          actionPath="/dashboard/chief-warden/review"
          emptyMessage="No applications pending final approval"
        />
      </div>
    </main>
  )
}
