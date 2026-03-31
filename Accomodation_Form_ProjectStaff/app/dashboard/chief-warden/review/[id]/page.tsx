import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ApprovalForm } from '@/components/approval-form'
import { ApplicationDetailsCard } from '@/components/application-details-card'
import { format } from 'date-fns'

const hostelNames: Record<string, string> = {
  BRAHMAPUTRA_BOYS: 'Brahmaputra Boys',
  CHENAB: 'Chenab',
  BEAS: 'Beas',
  SATLUJ: 'Satluj',
  BRAHMAPUTRA_GIRLS: 'Brahmaputra Girls',
  RAAVI: 'Raavi',
}

export default async function ChiefWardenReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  if (user.role !== 'CHIEF_WARDEN') {
    redirect('/dashboard')
  }

  const { id } = await params
  const application = await prisma.application.findUnique({
    where: { id, status: 'PENDING_CHIEF_WARDEN_APPROVAL' },
  })

  if (!application) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/chief-warden">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Final Review
          </h2>
          <p className="text-muted-foreground mt-2">
            Chief Warden Final Approval Stage
          </p>
        </div>

        {/* Show Allocation */}
        {application.allocatedHostel && (
          <Card className="border-primary">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Proposed Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Hostel</p>
                  <p className="font-semibold">
                    {hostelNames[application.allocatedHostel] || application.allocatedHostel}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room Number</p>
                  <p className="font-semibold">
                    {application.allocatedRoomNumber || 'To be assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stay Duration</p>
                  <p className="font-semibold">
                    {format(application.periodOfStayFrom, 'PP')} -{' '}
                    {format(application.periodOfStayTo, 'PP')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <ApplicationDetailsCard application={application} />

        <ApprovalForm
          applicationId={application.id}
          role="CHIEF_WARDEN"
          actions={[
            { value: 'APPROVED', label: 'Final Approve', icon: 'check' },
            { value: 'REJECTED', label: 'Reject', variant: 'destructive', icon: 'x' },
          ]}
          redirectPath="/dashboard/chief-warden"
        />
      </div>
    </main>
  )
}
