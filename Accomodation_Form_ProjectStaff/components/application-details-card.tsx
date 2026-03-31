import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HOSTEL_RENT_CATEGORIES } from '@/lib/types'
import { User, Mail, Phone, Building2, Calendar, FileText, MapPin } from 'lucide-react'

interface Application {
  id: string
  applicantName: string
  gender: string
  department: string
  fullAddress: string
  contactNumber: string
  emailId: string
  facultySupervisorName: string
  facultyEmail: string
  facultyContactNumber: string
  periodOfStayFrom: Date
  periodOfStayTo: Date
  dateOfArrival: Date
  dateOfDeparture: Date
  hostelRentCategory: string
  remarks?: string | null
}

interface ApplicationDetailsCardProps {
  application: Application
}

export function ApplicationDetailsCard({ application }: ApplicationDetailsCardProps) {
  const categoryInfo = HOSTEL_RENT_CATEGORIES.find(
    (cat) => cat.value === application.hostelRentCategory
  )

  return (
    <div className="space-y-4">
      {/* Applicant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Applicant Information
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

      {/* Faculty Info */}
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

      {/* Category */}
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
  )
}
