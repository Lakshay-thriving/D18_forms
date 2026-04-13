import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-tracker'
import { Plus, Calendar, Utensils, ArrowRight } from 'lucide-react'
import type { RequestStatus } from '@/lib/types'

export default async function RebateHistoryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'STUDENT') {
    redirect('/dashboard')
  }

  const requests = await prisma.rebateRequest.findMany({
    where: { studentId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rebate History</h1>
            <p className="text-muted-foreground">
              View all your submitted rebate requests
            </p>
          </div>
          <Button asChild>
            <Link href="/rebate/new">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No requests yet</h3>
              <p className="mb-4 text-center text-muted-foreground">
                {"You haven't submitted any rebate requests yet."}
              </p>
              <Button asChild>
                <Link href="/rebate/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Request
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Link key={request.id} href={`/rebate/${request.id}`}>
                <Card className="transition-all hover:shadow-md hover:border-primary/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {request.rebateType === 'PERSONAL_LEAVE' 
                            ? 'Personal Leave' 
                            : 'Official/Duty Leave'}
                        </CardTitle>
                        <CardDescription>
                          Submitted on {new Date(request.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <StatusBadge status={request.status as RequestStatus} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(request.fromDate).toLocaleDateString()} -{' '}
                          {new Date(request.toDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{request.totalDays}</span>
                        <span className="text-muted-foreground">days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                        <span>{request.totalMeals} meals</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-primary">
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
