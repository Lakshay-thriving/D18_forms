import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ApprovalForm } from '@/components/approval-form'
import { ApplicationDetailsCard } from '@/components/application-details-card'

export default async function JSAllocatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  if (user.role !== 'JUNIOR_SUPERINTENDENT') {
    redirect('/dashboard')
  }

  const { id } = await params
  const application = await prisma.application.findUnique({
    where: { id, status: 'PENDING_ALLOCATION' },
  })

  if (!application) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/junior-superintendent">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Allocate Hostel
          </h2>
          <p className="text-muted-foreground mt-2">
            Assign hostel and room to the applicant
          </p>
        </div>

        <ApplicationDetailsCard application={application} />

        <ApprovalForm
          applicationId={application.id}
          role="JUNIOR_SUPERINTENDENT"
          applicantGender={application.gender}
          showAllocation
          actions={[
            { value: 'PROCEED_TO_ALLOCATION', label: 'Allocate & Proceed', icon: 'check' },
          ]}
          redirectPath="/dashboard/junior-superintendent"
        />
      </div>
    </main>
  )
}
