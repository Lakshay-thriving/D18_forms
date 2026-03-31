"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowRight,
  User,
  Calendar,
  Building
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface User {
  id: string
  email: string
  name: string
  role: string
  department?: string
}

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

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  DRAFT: { label: "Draft", variant: "secondary", icon: FileText },
  SUBMITTED: { label: "Submitted", variant: "default", icon: Clock },
  FACULTY_APPROVED: { label: "Faculty Approved", variant: "default", icon: CheckCircle2 },
  FACULTY_REJECTED: { label: "Faculty Rejected", variant: "destructive", icon: XCircle },
  HOD_APPROVED: { label: "HOD Approved", variant: "default", icon: CheckCircle2 },
  HOD_REJECTED: { label: "HOD Rejected", variant: "destructive", icon: XCircle },
  JS_REVIEWED: { label: "JS Reviewed", variant: "default", icon: Clock },
  JS_SENT_BACK: { label: "Sent Back", variant: "outline", icon: AlertCircle },
  HOSTEL_ALLOCATED: { label: "Hostel Allocated", variant: "default", icon: Building },
  AR_APPROVED: { label: "AR Approved", variant: "default", icon: CheckCircle2 },
  AR_REJECTED: { label: "AR Rejected", variant: "destructive", icon: XCircle },
  CHIEF_WARDEN_APPROVED: { label: "CW Approved", variant: "default", icon: CheckCircle2 },
  CHIEF_WARDEN_REJECTED: { label: "CW Rejected", variant: "destructive", icon: XCircle },
  COMPLETED: { label: "Completed", variant: "default", icon: CheckCircle2 },
}

const roleLabels: Record<string, string> = {
  APPLICANT: "Applicant",
  FACULTY_MENTOR: "Faculty Mentor",
  HOD: "Head of Department",
  JUNIOR_SUPERINTENDENT: "Junior Superintendent",
  ASSISTANT_REGISTRAR: "Assistant Registrar",
  CHIEF_WARDEN: "Chief Warden",
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)

  const { data: sessionData } = useSWR("/api/auth/session", fetcher)
  const { data: applicationsData, error, isLoading } = useSWR(
    "/api/applications",
    fetcher,
    { refreshInterval: 30000 }
  )

  useEffect(() => {
    if (sessionData?.user) {
      setUser(sessionData.user)
    }
  }, [sessionData])

  const applications: Application[] = applicationsData?.applications || []

  const pendingCount = applications.filter(
    (a) => !a.status.includes("REJECTED") && a.status !== "COMPLETED"
  ).length
  const completedCount = applications.filter((a) => a.status === "COMPLETED").length
  const rejectedCount = applications.filter((a) => a.status.includes("REJECTED")).length

  const isApplicant = user?.role === "APPLICANT"

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-muted-foreground">
            {isApplicant
              ? "Track your hostel accommodation applications"
              : `Review ${applications.length} pending application${applications.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {isApplicant && (
          <Button asChild>
            <Link href="/dashboard/apply">
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Link>
          </Button>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {isApplicant ? "Pending" : "To Review"}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              {isApplicant ? "Applications in progress" : "Applications awaiting your action"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Applications rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Applications list */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isApplicant ? "Your Applications" : "Pending Applications"}
          </CardTitle>
          <CardDescription>
            {isApplicant
              ? "All your hostel accommodation requests"
              : "Applications requiring your review and action"}
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
              <h3 className="mt-4 text-lg font-medium">No applications</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {isApplicant
                  ? "You haven't submitted any applications yet."
                  : "No applications pending for your review."}
              </p>
              {isApplicant && (
                <Button asChild className="mt-4">
                  <Link href="/dashboard/apply">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Application
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const status = statusConfig[application.status] || {
                  label: application.status,
                  variant: "secondary" as const,
                  icon: Clock,
                }
                const StatusIcon = status.icon

                return (
                  <Link
                    key={application.id}
                    href={`/dashboard/applications/${application.id}`}
                    className="block"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <StatusIcon className="h-5 w-5 text-primary" />
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
