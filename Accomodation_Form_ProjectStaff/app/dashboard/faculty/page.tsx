import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ApplicationList } from '@/components/application-list'

export const metadata = {
  title: 'Faculty Dashboard - IIT Ropar Hostel',
}

export default async function FacultyDashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  if (user.role !== 'FACULTY_SUPERVISOR') {
    redirect('/dashboard')
  }

  // Get applications assigned to this faculty supervisor
  const applications = await prisma.application.findMany({
    where: {
      status: 'PENDING_FACULTY_APPROVAL',
      facultyEmail: {
        equals: user.email,
        mode: 'insensitive',
      },
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
            Faculty Supervisor Dashboard
          </h2>
          <p className="text-muted-foreground mt-2">
            Review and approve hostel allocation applications from your students
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {applications.length} application(s) pending your approval
          </p>
        </div>

        <ApplicationList
          applications={applications}
          actionPath="/dashboard/faculty/review"
          emptyMessage="No applications pending your approval"
        />
      </div>
    </main>
  )
}
