'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { APPLICATION_STATUS_LABELS } from '@/lib/types'
import { Eye, User, Calendar, Building2 } from 'lucide-react'

interface Application {
  id: string
  applicantName: string
  emailId: string
  department: string
  gender: string
  status: string
  periodOfStayFrom: string | Date
  periodOfStayTo: string | Date
  createdAt: string | Date
}

interface ApplicationListProps {
  applications: Application[]
  actionPath: string
  emptyMessage?: string
}

export function ApplicationList({
  applications,
  actionPath,
  emptyMessage = 'No applications found',
}: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const statusInfo = APPLICATION_STATUS_LABELS[application.status]
        
        return (
          <Card key={application.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-4 w-4" />
                    {application.applicantName}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    ID: {application.id}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    application.status === 'COMPLETED'
                      ? 'default'
                      : application.status === 'REJECTED'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {statusInfo?.label || application.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {application.department}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(application.periodOfStayFrom), 'PP')} -{' '}
                  {format(new Date(application.periodOfStayTo), 'PP')}
                </div>
                <div>
                  Submitted: {format(new Date(application.createdAt), 'PP')}
                </div>
              </div>
              <Link href={`${actionPath}/${application.id}`}>
                <Button>
                  <Eye className="mr-2 h-4 w-4" />
                  Review Application
                </Button>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
