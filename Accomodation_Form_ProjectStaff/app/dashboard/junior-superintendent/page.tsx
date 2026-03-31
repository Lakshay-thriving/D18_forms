import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ApplicationList } from '@/components/application-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata = {
  title: 'Junior Superintendent Dashboard - IIT Ropar Hostel',
}

export default async function JuniorSuperintendentDashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  if (user.role !== 'JUNIOR_SUPERINTENDENT') {
    redirect('/dashboard')
  }

  const [pendingReview, pendingAllocation] = await Promise.all([
    prisma.application.findMany({
      where: { status: 'PENDING_HOSTEL_REVIEW' },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.application.findMany({
      where: { status: 'PENDING_ALLOCATION' },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Junior Superintendent Dashboard
          </h2>
          <p className="text-muted-foreground mt-2">
            Review applications and allocate hostels
          </p>
        </div>

        <Tabs defaultValue="review" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="review">
              Pending Review ({pendingReview.length})
            </TabsTrigger>
            <TabsTrigger value="allocation">
              Pending Allocation ({pendingAllocation.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="review">
            <ApplicationList
              applications={pendingReview}
              actionPath="/dashboard/junior-superintendent/review"
              emptyMessage="No applications pending review"
            />
          </TabsContent>
          
          <TabsContent value="allocation">
            <ApplicationList
              applications={pendingAllocation}
              actionPath="/dashboard/junior-superintendent/allocate"
              emptyMessage="No applications pending allocation"
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
