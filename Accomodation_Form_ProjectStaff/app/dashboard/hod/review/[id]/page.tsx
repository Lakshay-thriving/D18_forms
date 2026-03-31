import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ApprovalForm } from '@/components/approval-form'
import { ApplicationDetailsCard } from '@/components/application-details-card'

export default async function HODReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }
  
  if (user.role !== 'HOD') {
    redirect('/dashboard')
  }

  const { id } = await params
  
  // Only show applications from the HOD's department
  const application = await prisma.application.findFirst({
    where: { 
      id, 
      status: 'PENDING_HOD_RECOMMENDATION',
      ...(user.department && {
        department: {
          equals: user.department,
          mode: 'insensitive',
        },
      }),
    },
  })

  if (!application) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/hod">
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
            HOD Recommendation Stage
          </p>
        </div>

        <ApplicationDetailsCard application={application} />

        <ApprovalForm
          applicationId={application.id}
          role="HOD"
          actions={[
            { value: 'RECOMMENDED', label: 'Recommend', icon: 'check' },
            { value: 'REJECTED', label: 'Reject', variant: 'destructive', icon: 'x' },
          ]}
          redirectPath="/dashboard/hod"
        />
      </div>
    </main>
  )
}
