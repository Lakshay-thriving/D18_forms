import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ApprovalForm } from '@/components/approval-form'
import { ApplicationDetailsCard } from '@/components/application-details-card'

const hostelNames: Record<string, string> = {
  BRAHMAPUTRA_BOYS: 'Brahmaputra Boys',
  CHENAB: 'Chenab',
  BEAS: 'Beas',
  SATLUJ: 'Satluj',
  BRAHMAPUTRA_GIRLS: 'Brahmaputra Girls',
  RAAVI: 'Raavi',
}

export default async function ARReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  if (user.role !== 'ASSISTANT_REGISTRAR') {
    redirect('/dashboard')
  }

  const { id } = await params
  const application = await prisma.application.findUnique({
    where: { id, status: 'PENDING_AR_APPROVAL' },
  })

  if (!application) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/assistant-registrar">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Review Application
          </h2>
          <p className="text-muted-foreground mt-2">
            Assistant Registrar Approval Stage
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
              <div className="grid gap-4 md:grid-cols-2">
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
              </div>
            </CardContent>
          </Card>
        )}

        <ApplicationDetailsCard application={application} />

        <ApprovalForm
          applicationId={application.id}
          role="ASSISTANT_REGISTRAR"
          actions={[
            { value: 'APPROVED', label: 'Approve', icon: 'check' },
            { value: 'REJECTED', label: 'Reject', variant: 'destructive', icon: 'x' },
          ]}
          redirectPath="/dashboard/assistant-registrar"
        />
      </div>
    </main>
  )
}
