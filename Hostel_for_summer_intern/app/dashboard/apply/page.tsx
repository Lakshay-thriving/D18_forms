"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { format } from "date-fns"
import { CalendarIcon, Upload, X, FileText, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Faculty {
  id: string
  name: string
  email: string
  department: string
  contactNumber?: string
}

const steps = [
  { id: 1, name: "Personal Details" },
  { id: 2, name: "Faculty Mentor" },
  { id: 3, name: "Stay Details" },
  { id: 4, name: "Financial & Documents" },
  { id: 5, name: "Review & Submit" },
]

const departmentLabels: Record<string, string> = {
  COMPUTER_SCIENCE: "Computer Science",
  ELECTRICAL_ENGINEERING: "Electrical Engineering",
  MECHANICAL_ENGINEERING: "Mechanical Engineering",
  CIVIL_ENGINEERING: "Civil Engineering",
  CHEMICAL_ENGINEERING: "Chemical Engineering",
  BIOMEDICAL_ENGINEERING: "Biomedical Engineering",
  MATHEMATICS: "Mathematics",
  PHYSICS: "Physics",
  CHEMISTRY: "Chemistry",
  HUMANITIES: "Humanities",
}

export default function ApplyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)

  const { data: sessionData } = useSWR("/api/auth/session", fetcher)
  const { data: facultyData } = useSWR("/api/users/faculty", fetcher)

  const faculty: Faculty[] = facultyData?.faculty || []

  // Form state
  const [formData, setFormData] = useState({
    applicantName: "",
    gender: "",
    affiliation: "",
    fullAddress: "",
    contactNumber: "",
    applicantEmail: "",
    facultyMentorId: "",
    facultyMentorName: "",
    facultyMentorEmail: "",
    facultyMentorContact: "",
    internshipStartDate: null as Date | null,
    internshipEndDate: null as Date | null,
    arrivalDate: null as Date | null,
    departureDate: null as Date | null,
    financialSupport: "",
    hostelCategory: "CATEGORY_A",
    remarks: "",
    declarationAccepted: false,
  })

  const [documents, setDocuments] = useState<{ name: string; type: string; file: File | null }[]>([
    { name: "", type: "offer_letter", file: null },
  ])

  useEffect(() => {
    if (sessionData?.user) {
      setFormData((prev) => ({
        ...prev,
        applicantName: sessionData.user.name || "",
        applicantEmail: sessionData.user.email || "",
      }))
    }
  }, [sessionData])

  const handleFacultySelect = (facultyId: string) => {
    const selectedFaculty = faculty.find((f) => f.id === facultyId)
    if (selectedFaculty) {
      setFormData((prev) => ({
        ...prev,
        facultyMentorId: selectedFaculty.id,
        facultyMentorName: selectedFaculty.name,
        facultyMentorEmail: selectedFaculty.email,
        facultyMentorContact: selectedFaculty.contactNumber || "",
      }))
    }
  }

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDocumentChange = (index: number, file: File | null) => {
    const newDocs = [...documents]
    newDocs[index] = { ...newDocs[index], name: file?.name || "", file }
    setDocuments(newDocs)
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.applicantName || !formData.gender || !formData.affiliation || 
            !formData.fullAddress || !formData.contactNumber || !formData.applicantEmail) {
          toast.error("Please fill in all required fields")
          return false
        }
        return true
      case 2:
        if (!formData.facultyMentorName || !formData.facultyMentorEmail || !formData.facultyMentorContact) {
          toast.error("Please fill in all faculty mentor details")
          return false
        }
        if (!formData.facultyMentorEmail.endsWith("@iitrpr.ac.in")) {
          toast.error("Faculty email must be an IIT Ropar email (@iitrpr.ac.in)")
          return false
        }
        return true
      case 3:
        if (!formData.internshipStartDate || !formData.internshipEndDate || 
            !formData.arrivalDate || !formData.departureDate) {
          toast.error("Please fill in all date fields")
          return false
        }
        return true
      case 4:
        if (!formData.hostelCategory) {
          toast.error("Please select a hostel rent category")
          return false
        }
        return true
      case 5:
        if (!formData.declarationAccepted) {
          toast.error("Please accept the declaration")
          return false
        }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return

    setIsSubmitting(true)
    try {
      // Create application
      const appResponse = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          financialSupport: parseFloat(formData.financialSupport) || 0,
          internshipStartDate: formData.internshipStartDate?.toISOString(),
          internshipEndDate: formData.internshipEndDate?.toISOString(),
          arrivalDate: formData.arrivalDate?.toISOString(),
          departureDate: formData.departureDate?.toISOString(),
        }),
      })

      if (!appResponse.ok) {
        const error = await appResponse.json()
        throw new Error(error.error || "Failed to create application")
      }

      const { application } = await appResponse.json()
      setApplicationId(application.id)

      // Upload documents (simulated - in real app would use Blob storage)
      for (const doc of documents) {
        if (doc.file) {
          await fetch(`/api/applications/${application.id}/documents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: doc.name,
              type: doc.type,
              url: `/documents/${doc.file.name}`, // Placeholder URL
            }),
          })
        }
      }

      // Submit application
      const submitResponse = await fetch(`/api/applications/${application.id}/submit`, {
        method: "POST",
      })

      if (!submitResponse.ok) {
        const error = await submitResponse.json()
        throw new Error(error.error || "Failed to submit application")
      }

      toast.success("Application submitted successfully!")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress indicator */}
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li key={step.id} className={cn("relative", index !== steps.length - 1 && "flex-1")}>
              <div className="flex items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-2 border-primary text-primary"
                      : "border-2 border-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </span>
                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      "ml-2 h-0.5 flex-1",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
              <span className="absolute -bottom-6 left-0 text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                {step.name}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <div className="pt-8">
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>Enter your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="applicantName">Full Name *</Label>
                  <Input
                    id="applicantName"
                    value={formData.applicantName}
                    onChange={(e) => updateFormData("applicantName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => updateFormData("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliation">Affiliation (Institute/College) *</Label>
                <Input
                  id="affiliation"
                  value={formData.affiliation}
                  onChange={(e) => updateFormData("affiliation", e.target.value)}
                  placeholder="Enter your institute/college name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullAddress">Full Address *</Label>
                <Textarea
                  id="fullAddress"
                  value={formData.fullAddress}
                  onChange={(e) => updateFormData("fullAddress", e.target.value)}
                  placeholder="Enter your full address"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => updateFormData("contactNumber", e.target.value)}
                    placeholder="Enter contact number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicantEmail">Email ID *</Label>
                  <Input
                    id="applicantEmail"
                    type="email"
                    value={formData.applicantEmail}
                    onChange={(e) => updateFormData("applicantEmail", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Faculty Mentor */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Faculty Mentor Details</CardTitle>
              <CardDescription>
                Select your faculty mentor or enter their details manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faculty.length > 0 && (
                <div className="space-y-2">
                  <Label>Select Faculty Mentor</Label>
                  <Select onValueChange={handleFacultySelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select from registered faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculty.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name} - {departmentLabels[f.department] || f.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Or enter details manually below
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="facultyMentorName">Faculty Mentor Name *</Label>
                <Input
                  id="facultyMentorName"
                  value={formData.facultyMentorName}
                  onChange={(e) => updateFormData("facultyMentorName", e.target.value)}
                  placeholder="Enter faculty mentor name"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="facultyMentorEmail">Faculty Email (@iitrpr.ac.in) *</Label>
                  <Input
                    id="facultyMentorEmail"
                    type="email"
                    value={formData.facultyMentorEmail}
                    onChange={(e) => updateFormData("facultyMentorEmail", e.target.value)}
                    placeholder="faculty@iitrpr.ac.in"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facultyMentorContact">Faculty Contact Number *</Label>
                  <Input
                    id="facultyMentorContact"
                    type="tel"
                    value={formData.facultyMentorContact}
                    onChange={(e) => updateFormData("facultyMentorContact", e.target.value)}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Stay Details */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Stay Details</CardTitle>
              <CardDescription>Enter your internship and stay period details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Internship Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.internshipStartDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.internshipStartDate
                          ? format(formData.internshipStartDate, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.internshipStartDate || undefined}
                        onSelect={(date) => updateFormData("internshipStartDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Internship End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.internshipEndDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.internshipEndDate
                          ? format(formData.internshipEndDate, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.internshipEndDate || undefined}
                        onSelect={(date) => updateFormData("internshipEndDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Arrival Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.arrivalDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.arrivalDate
                          ? format(formData.arrivalDate, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.arrivalDate || undefined}
                        onSelect={(date) => updateFormData("arrivalDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Departure Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.departureDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.departureDate
                          ? format(formData.departureDate, "PPP")
                          : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.departureDate || undefined}
                        onSelect={(date) => updateFormData("departureDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Financial & Documents */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Financial & Document Details</CardTitle>
              <CardDescription>Enter financial details and upload required documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="financialSupport">Financial Support (if any)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    Rs.
                  </span>
                  <Input
                    id="financialSupport"
                    type="number"
                    className="pl-10"
                    value={formData.financialSupport}
                    onChange={(e) => updateFormData("financialSupport", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Hostel Rent Category *</Label>
                <RadioGroup
                  value={formData.hostelCategory}
                  onValueChange={(value) => updateFormData("hostelCategory", value)}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="CATEGORY_A" id="cat_a" className="mt-1" />
                    <div>
                      <Label htmlFor="cat_a" className="font-medium cursor-pointer">
                        Category A
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Internship students without financial support OR with less than Rs. 10,000/month or not entitled to reimbursement
                      </p>
                      <p className="text-sm font-medium text-primary mt-1">
                        Rs. 75/day or Rs. 1500/month (whichever is lower)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-lg border p-4">
                    <RadioGroupItem value="CATEGORY_B" id="cat_b" className="mt-1" />
                    <div>
                      <Label htmlFor="cat_b" className="font-medium cursor-pointer">
                        Category B
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Internship students with financial support above Rs. 10,000/month
                      </p>
                      <p className="text-sm font-medium text-primary mt-1">
                        Rs. 150/day
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Upload Required Documents</Label>
                <div className="space-y-3">
                  {[
                    { type: "offer_letter", label: "IIT Ropar Offer Letter *" },
                  ].map((doc, index) => (
                    <div key={doc.type} className="flex items-center gap-3 rounded-lg border p-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{doc.label}</p>
                        {documents[index]?.name ? (
                          <p className="text-xs text-muted-foreground truncate">
                            {documents[index].name}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">No file selected</p>
                        )}
                      </div>
                      {documents[index]?.file ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDocumentChange(index, null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <label className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                handleDocumentChange(index, file)
                              }}
                            />
                          </label>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (if any)</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => updateFormData("remarks", e.target.value)}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>Review your application before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Personal Details</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span>{formData.applicantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender</span>
                      <span>{formData.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Affiliation</span>
                      <span>{formData.affiliation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact</span>
                      <span>{formData.contactNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span>{formData.applicantEmail}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Faculty Mentor</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span>{formData.facultyMentorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span>{formData.facultyMentorEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact</span>
                      <span>{formData.facultyMentorContact}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Stay Details</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Internship Period</span>
                      <span>
                        {formData.internshipStartDate && format(formData.internshipStartDate, "dd MMM yyyy")} -{" "}
                        {formData.internshipEndDate && format(formData.internshipEndDate, "dd MMM yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stay Period</span>
                      <span>
                        {formData.arrivalDate && format(formData.arrivalDate, "dd MMM yyyy")} -{" "}
                        {formData.departureDate && format(formData.departureDate, "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="font-medium">Financial Details</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Financial Support</span>
                      <span>Rs. {formData.financialSupport || "0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hostel Category</span>
                      <span>
                        {formData.hostelCategory === "CATEGORY_A" ? "Category A" : "Category B"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="declaration"
                    checked={formData.declarationAccepted}
                    onCheckedChange={(checked) =>
                      updateFormData("declarationAccepted", checked === true)
                    }
                  />
                  <label htmlFor="declaration" className="text-sm leading-relaxed cursor-pointer">
                    I agree to abide by hostel rules and regulations and shall vacate the hostel
                    accommodation when required by Hostel Management. I confirm that all information
                    provided above is true and accurate.
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          {currentStep < 5 ? (
            <Button onClick={nextStep}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Spinner className="mr-2" /> : null}
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
