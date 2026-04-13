"use client"

import Link from "next/link"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, 
  ArrowRight,
  User,
  Calendar,
  Building,
  FileText
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface Application {
  id: string
  applicantName: string
  applicantEmail: string
  status: string
  createdAt: string
  updatedAt: string
  submittedAt?: string
  facultyMentorName: string
  allocatedHostel?: string
  allocatedRoom?: string
  internshipStartDate: string
  internshipEndDate: string
  approvalActions: {
    id: string
    action: string
    role: string
    remarks?: string
    createdAt: string
    user: { name: string; role: string }
  }[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  FACULTY_APPROVED: { label: "Faculty Approved", variant: "default" },
  HOD_APPROVED: { label: "HOD Approved", variant: "default" },
  HOSTEL_ALLOCATED: { label: "Hostel Allocated", variant: "default" },
  AR_APPROVED: { label: "AR Approved", variant: "default" },
  CHIEF_WARDEN_APPROVED: { label: "CW Approved", variant: "default" },
  COMPLETED: { label: "Completed", variant: "default" },
}

export default function ApprovedPage() {
  const { data, error, isLoading } = useSWR(
    "/api/applications?approved=true",
    fetcher,
    { refreshInterval: 30000 }
  )

  const applications: Application[] = data?.applications || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approved Applications</h1>
        <p className="text-muted-foreground">
          Applications you have approved or that have completed the approval process
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application History</CardTitle>
          <CardDescription>
            View all applications that have been processed through your approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load applications
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No approved applications</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Applications you approve will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const status = statusConfig[application.status] || {
                  label: application.status,
                  variant: "secondary" as const,
                }

                return (
                  <Link
                    key={application.id}
                    href={`/dashboard/applications/${application.id}`}
                    className="block"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium truncate">
                            {application.applicantName}
                          </h4>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {application.facultyMentorName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(application.internshipStartDate), "dd MMM")} -{" "}
                            {format(new Date(application.internshipEndDate), "dd MMM yyyy")}
                          </span>
                          {application.allocatedHostel && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {application.allocatedHostel}
                              {application.allocatedRoom && ` - Room ${application.allocatedRoom}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(application.updatedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
