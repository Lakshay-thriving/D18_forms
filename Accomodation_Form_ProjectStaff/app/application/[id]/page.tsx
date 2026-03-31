import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Building2, ArrowLeft, Calendar, User, Mail, Phone, MapPin, FileText, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusTracker } from '@/components/status-tracker'
import { DocumentViewer } from '@/components/document-viewer'
import { ApprovalHistory } from '@/components/approval-history'
import { prisma } from '@/lib/prisma'
import { APPLICATION_STATUS_LABELS, HOSTEL_RENT_CATEGORIES } from '@/lib/types'
import { format } from 'date-fns'

async function getApplication(id: string) {
  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        approvals: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    return application
  } catch {
    return null
  }
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const application = await getApplication(id)

  if (!application) {
    notFound()
  }

  const statusInfo = APPLICATION_STATUS_LABELS[application.status]
  const categoryInfo = HOSTEL_RENT_CATEGORIES.find(
    (cat) => cat.value === application.hostelRentCategory
  )

  const hostelNames: Record<string, string> = {
    BRAHMAPUTRA_BOYS: 'Brahmaputra Boys',
    CHENAB: 'Chenab',
    BEAS: 'Beas',
    SATLUJ: 'Satluj',
    BRAHMAPUTRA_GIRLS: 'Brahmaputra Girls',
    RAAVI: 'Raavi',
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="font-bold text-lg">IIT Ropar</h1>
                <p className="text-xs text-muted-foreground">
                  Hostel Allocation System
                </p>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header with Status */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Application Details
              </h2>
              <p className="text-muted-foreground mt-1">
                Application ID: <code className="bg-muted px-2 py-1 rounded">{application.id}</code>
              </p>
            </div>
            <Badge
              variant={
                application.status === 'COMPLETED'
                  ? 'default'
                  : application.status === 'REJECTED'
                  ? 'destructive'
                  : 'secondary'
              }
              className="text-sm py-1 px-3"
            >
              {statusInfo?.label || application.status}
            </Badge>
          </div>

          {/* Status Tracker */}
          <Card>
            <CardHeader>
              <CardTitle>Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTracker currentStatus={application.status} />
            </CardContent>
          </Card>

          {/* Allocation Info (if completed) */}
          {application.status === 'COMPLETED' && application.allocatedHostel && (
            <Card className="border-primary">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Hostel Allocation
                </CardTitle>
                <CardDescription>
                  Your hostel room has been allocated
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Hostel</p>
                    <p className="font-semibold text-lg">
                      {hostelNames[application.allocatedHostel] || application.allocatedHostel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Room Number</p>
                    <p className="font-semibold text-lg">
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

          {/* Applicant Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Applicant Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{application.applicantName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{application.gender.toLowerCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{application.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{application.emailId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">{application.contactNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:col-span-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{application.fullAddress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Faculty Supervisor Details */}
          <Card>
            <CardHeader>
              <CardTitle>Faculty Supervisor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{application.facultySupervisorName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{application.facultyEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{application.facultyContactNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stay Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Stay Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Period of Stay</p>
                  <p className="font-medium">
                    {format(application.periodOfStayFrom, 'PPP')} to{' '}
                    {format(application.periodOfStayTo, 'PPP')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Arrival</p>
                  <p className="font-medium">
                    {format(application.dateOfArrival, 'PPP p')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departure</p>
                  <p className="font-medium">
                    {format(application.dateOfDeparture, 'PPP p')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category & Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Category & Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryInfo && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h4 className="font-semibold">{categoryInfo.label}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {categoryInfo.description}
                  </p>
                  <div className="mt-3 flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Rate:</span>{' '}
                      <span className="font-medium">{categoryInfo.rate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deposit:</span>{' '}
                      <span className="font-medium">{categoryInfo.deposit}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-4">
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  Offer Letter: Uploaded
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <FileText className="h-3 w-3" />
                  ID Proof: Uploaded
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Documents Viewer */}
          <DocumentViewer
            documents={[
              {
                name: 'Offer Letter',
                url: application.offerLetterUrl,
                type: 'pdf',
              },
              {
                name: 'ID Proof',
                url: application.idProofUrl,
                type: 'image',
              },
            ]}
          />

          {/* Approval History */}
          <ApprovalHistory approvals={application.approvals} currentStatus={application.status} />

          {/* Remarks */}
          {application.remarks && (
            <Card>
              <CardHeader>
                <CardTitle>Applicant Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{application.remarks}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
