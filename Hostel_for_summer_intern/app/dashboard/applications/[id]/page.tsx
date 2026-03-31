"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { format } from "date-fns"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Building,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

interface User {
  id: string
  email: string
  name: string
  role: string
  department?: string
}

interface Document {
  id: string
  name: string
  type: string
  url: string
  uploadedAt: string
}

interface ApprovalAction {
  id: string
  action: string
  role: string
  remarks?: string
  signature?: string
  allocatedHostel?: string
  allocatedRoom?: string
  createdAt: string
  user: { name: string; role: string; department?: string }
}

interface Application {
  id: string
  applicantName: string
  applicantEmail: string
  gender: string
  affiliation: string
  fullAddress: string
  contactNumber: string
  facultyMentorName: string
  facultyMentorEmail: string
  facultyMentorContact: string
  internshipStartDate: string
  internshipEndDate: string
  arrivalDate: string
  departureDate: string
  financialSupport: number
  hostelCategory: string
  allocatedHostel?: string
  allocatedRoom?: string
  status: string
  remarks?: string
  declarationAccepted: boolean
  createdAt: string
  updatedAt: string
  submittedAt?: string
  documents: Document[]
  approvalActions: ApprovalAction[]
  applicant: { id: string; name: string; email: string }
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

const documentTypeLabels: Record<string, string> = {
  offer_letter: "IIT Ropar Offer Letter",
}

const boyHostels = ["Brahmaputra Boys", "Chenab", "Beas", "Satluj"]
const girlHostels = ["Brahmaputra Girls", "Raavi"]

const workflowSteps = [
  { role: "FACULTY_MENTOR", label: "Faculty Mentor", approvedStatus: "FACULTY_APPROVED" },
  { role: "HOD", label: "HOD", approvedStatus: "HOD_APPROVED" },
  { role: "JUNIOR_SUPERINTENDENT", label: "Junior Superintendent", approvedStatus: "HOSTEL_ALLOCATED" },
  { role: "ASSISTANT_REGISTRAR", label: "Assistant Registrar", approvedStatus: "AR_APPROVED" },
  { role: "CHIEF_WARDEN", label: "Chief Warden", approvedStatus: "COMPLETED" },
]

export default function ApplicationDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [remarks, setRemarks] = useState("")
  const [signature, setSignature] = useState("")
  const [allocatedHostel, setAllocatedHostel] = useState("")
  const [allocatedRoom, setAllocatedRoom] = useState("")

  const { data: sessionData } = useSWR("/api/auth/session", fetcher)
  const { data, error, isLoading, mutate } = useSWR(
    `/api/applications/${resolvedParams.id}`,
    fetcher
  )

  useEffect(() => {
    if (sessionData?.user) {
      setUser(sessionData.user)
    }
  }, [sessionData])

  const application: Application | null = data?.application

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Application not found</h2>
        <p className="text-muted-foreground mt-2">
          The application you are looking for does not exist.
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  const status = statusConfig[application.status] || {
    label: application.status,
    variant: "secondary" as const,
    icon: Clock,
  }
  const StatusIcon = status.icon

  // Determine if current user can take action
  const canTakeAction = () => {
    if (!user) return false

    switch (user.role) {
      case "FACULTY_MENTOR":
        return application.status === "SUBMITTED" && application.facultyMentorEmail === user.email
      case "HOD":
        // Check if faculty who approved is from same department as HOD
        const facultyApproval = application.approvalActions.find(
          a => a.role === "FACULTY_MENTOR" && a.action === "APPROVED"
        )
        return application.status === "FACULTY_APPROVED" && 
               facultyApproval?.user?.department === user.department
      case "JUNIOR_SUPERINTENDENT":
        return application.status === "HOD_APPROVED"
      case "ASSISTANT_REGISTRAR":
        return application.status === "HOSTEL_ALLOCATED"
      case "CHIEF_WARDEN":
        return application.status === "AR_APPROVED"
      default:
        return false
    }
  }

  const handleAction = async (action: string) => {
    if (!user) return

    // Validation for JS allocation
    if (user.role === "JUNIOR_SUPERINTENDENT" && action === "ALLOCATED") {
      if (!allocatedHostel) {
        toast.error("Please select a hostel for allocation")
        return
      }
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/applications/${application.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          remarks,
          signature: signature || user.name,
          allocatedHostel: allocatedHostel || undefined,
          allocatedRoom: allocatedRoom || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process action")
      }

      toast.success(
        action === "APPROVED" || action === "ALLOCATED"
          ? "Application approved successfully"
          : action === "SENT_BACK"
          ? "Application sent back for corrections"
          : "Application rejected"
      )
      mutate()
      setRemarks("")
      setSignature("")
      setAllocatedHostel("")
      setAllocatedRoom("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process action")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get current workflow step
  const getCurrentStep = () => {
    if (application.status === "SUBMITTED") return 0
    if (application.status === "FACULTY_APPROVED") return 1
    if (application.status === "HOD_APPROVED") return 2
    if (application.status === "HOSTEL_ALLOCATED") return 3
    if (application.status === "AR_APPROVED") return 4
    if (application.status === "COMPLETED") return 5
    return -1
  }

  const currentStep = getCurrentStep()

  // Get hostels based on gender
  const availableHostels = application.gender === "MALE" ? boyHostels : girlHostels

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              {application.applicantName}
            </h1>
            <Badge variant={status.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Application ID: {application.id.slice(0, 8)}...
          </p>
        </div>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Approval Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {workflowSteps.map((step, index) => {
              const isCompleted = currentStep > index
              const isCurrent = currentStep === index
              const isRejected = application.status.includes("REJECTED")
              const rejectedAt = isRejected && application.approvalActions.some(
                a => a.role === step.role && a.action === "REJECTED"
              )

              return (
                <div key={step.role} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : rejectedAt
                          ? "bg-destructive text-destructive-foreground"
                          : isCurrent
                          ? "border-2 border-primary text-primary"
                          : "border-2 border-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : rejectedAt ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="mt-2 text-xs text-center text-muted-foreground hidden sm:block">
                      {step.label}
                    </span>
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 mx-2",
                        isCompleted ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Details */}
          <Card>
            <CardHeader>
              <CardTitle>Applicant Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{application.applicantName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">{application.gender}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{application.applicantEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{application.contactNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Affiliation</p>
                    <p className="font-medium">{application.affiliation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{application.fullAddress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Faculty Mentor Details */}
          <Card>
            <CardHeader>
              <CardTitle>Faculty Mentor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{application.facultyMentorName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{application.facultyMentorEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{application.facultyMentorContact}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <Card>
            <CardHeader>
              <CardTitle>Stay Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Internship Period</p>
                    <p className="font-medium">
                      {format(new Date(application.internshipStartDate), "dd MMM yyyy")} -{" "}
                      {format(new Date(application.internshipEndDate), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stay Period</p>
                    <p className="font-medium">
                      {format(new Date(application.arrivalDate), "dd MMM yyyy")} -{" "}
                      {format(new Date(application.departureDate), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Financial Support</p>
                  <p className="font-medium">Rs. {application.financialSupport || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hostel Category</p>
                  <p className="font-medium">
                    {application.hostelCategory === "CATEGORY_A" ? "Category A" : "Category B"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {application.hostelCategory === "CATEGORY_A"
                      ? "Rs. 75/day or Rs. 1500/month (whichever is lower)"
                      : "Rs. 150/day"}
                  </p>
                </div>
              </div>
              {application.allocatedHostel && (
                <>
                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Allocated Hostel</p>
                      <p className="font-medium">{application.allocatedHostel}</p>
                    </div>
                    {application.allocatedRoom && (
                      <div>
                        <p className="text-sm text-muted-foreground">Room Number</p>
                        <p className="font-medium">{application.allocatedRoom}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Uploaded documents for this application</CardDescription>
            </CardHeader>
            <CardContent>
              {application.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded</p>
              ) : (
                <div className="space-y-3">
                  {application.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {documentTypeLabels[doc.type] || doc.type}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{doc.name}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval History */}
          <Card>
            <CardHeader>
              <CardTitle>Approval History</CardTitle>
              <CardDescription>Track all approval actions on this application</CardDescription>
            </CardHeader>
            <CardContent>
              {application.approvalActions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No approval actions yet</p>
              ) : (
                <div className="space-y-4">
                  {application.approvalActions.map((action, index) => (
                    <div key={action.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full",
                            action.action === "APPROVED" || action.action === "ALLOCATED"
                              ? "bg-primary/10 text-primary"
                              : action.action === "REJECTED"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {action.action === "APPROVED" || action.action === "ALLOCATED" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : action.action === "REJECTED" ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </div>
                        {index < application.approvalActions.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{action.user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {roleLabels[action.role]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.action === "APPROVED"
                            ? "Approved this application"
                            : action.action === "REJECTED"
                            ? "Rejected this application"
                            : action.action === "SENT_BACK"
                            ? "Sent back for corrections"
                            : action.action === "ALLOCATED"
                            ? `Allocated ${action.allocatedHostel}${action.allocatedRoom ? ` - Room ${action.allocatedRoom}` : ""}`
                            : action.action}
                        </p>
                        {action.remarks && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <span className="text-muted-foreground">Remarks: </span>
                            {action.remarks}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(action.createdAt), "dd MMM yyyy, hh:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Action Panel */}
        <div className="space-y-6">
          {/* Action Panel */}
          {canTakeAction() && (
            <Card>
              <CardHeader>
                <CardTitle>Take Action</CardTitle>
                <CardDescription>
                  Review and process this application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hostel Allocation for JS */}
                {user?.role === "JUNIOR_SUPERINTENDENT" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Allocate Hostel *</Label>
                      <Select value={allocatedHostel} onValueChange={setAllocatedHostel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hostel" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHostels.map((hostel) => (
                            <SelectItem key={hostel} value={hostel}>
                              {hostel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Room Number (Optional)</Label>
                      <Input
                        placeholder="Enter room number"
                        value={allocatedRoom}
                        onChange={(e) => setAllocatedRoom(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Textarea
                    placeholder="Add remarks (optional)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Digital Signature</Label>
                  <Input
                    placeholder={user?.name || "Your name"}
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                  />
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  {user?.role === "JUNIOR_SUPERINTENDENT" ? (
                    <>
                      <Button
                        onClick={() => handleAction("ALLOCATED")}
                        disabled={isSubmitting || !allocatedHostel}
                        className="w-full"
                      >
                        {isSubmitting ? <Spinner className="mr-2" /> : null}
                        Allocate Hostel
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAction("SENT_BACK")}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        Send Back for Corrections
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleAction("APPROVED")}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? <Spinner className="mr-2" /> : null}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleAction("REJECTED")}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(application.createdAt), "dd MMM yyyy")}</span>
              </div>
              {application.submittedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{format(new Date(application.submittedAt), "dd MMM yyyy")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{format(new Date(application.updatedAt), "dd MMM yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Declaration</span>
                <span>{application.declarationAccepted ? "Accepted" : "Pending"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Remarks from Applicant */}
          {application.remarks && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Applicant Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{application.remarks}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
