'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateTimePicker } from '@/components/date-time-picker'
import { FileUpload } from '@/components/file-upload'
import { HOSTEL_RENT_CATEGORIES } from '@/lib/types'
import { DEPARTMENT_OPTIONS } from '@/lib/departments'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  // Applicant Details
  applicantName: z.string().min(2, 'Name must be at least 2 characters'),
  gender: z.enum(['MALE', 'FEMALE'], { required_error: 'Please select gender' }),
  department: z.string().min(2, 'Department is required'),
  fullAddress: z.string().min(10, 'Please provide full address'),
  contactNumber: z.string().regex(/^\d{10}$/, 'Contact number must be 10 digits'),
  emailId: z.string().email('Invalid email address'),
  
  // Faculty Supervisor Details
  facultySupervisorName: z.string().min(2, 'Faculty name is required'),
  facultyEmail: z.string().email('Invalid email').refine(
    (email) => email.endsWith('@iitrpr.ac.in'),
    'Faculty email must be @iitrpr.ac.in'
  ),
  facultyContactNumber: z.string().regex(/^\d{10}$/, 'Contact number must be 10 digits'),
  
  // Stay Details
  periodOfStayFrom: z.date({ required_error: 'Start date is required' }),
  periodOfStayTo: z.date({ required_error: 'End date is required' }),
  dateOfArrival: z.date({ required_error: 'Arrival date is required' }),
  dateOfDeparture: z.date({ required_error: 'Departure date is required' }),
  
  // Category
  hostelRentCategory: z.enum(['CATEGORY_A', 'CATEGORY_B'], {
    required_error: 'Please select a category',
  }),
  
  // Additional
  remarks: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
  applicantSignature: z.string().min(2, 'Signature is required'),
})

type FormValues = z.infer<typeof formSchema>

export function ApplicationForm() {
  const router = useRouter()
  const [offerLetter, setOfferLetter] = React.useState<File | null>(null)
  const [idProof, setIdProof] = React.useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [fileErrors, setFileErrors] = React.useState({
    offerLetter: '',
    idProof: '',
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicantName: '',
      department: '',
      fullAddress: '',
      contactNumber: '',
      emailId: '',
      facultySupervisorName: '',
      facultyEmail: '',
      facultyContactNumber: '',
      remarks: '',
      agreeToTerms: false,
      applicantSignature: '',
    },
  })

  const selectedCategory = form.watch('hostelRentCategory')
  const categoryInfo = HOSTEL_RENT_CATEGORIES.find(
    (cat) => cat.value === selectedCategory
  )

  async function onSubmit(data: FormValues) {
    // Validate files
    const errors = { offerLetter: '', idProof: '' }
    if (!offerLetter) {
      errors.offerLetter = 'Offer letter is required'
    }
    if (!idProof) {
      errors.idProof = 'ID proof is required'
    }
    
    if (errors.offerLetter || errors.idProof) {
      setFileErrors(errors)
      return
    }

    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString())
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString())
        } else if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })
      
      // Add files
      formData.append('offerLetter', offerLetter!)
      formData.append('idProof', idProof!)
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit application')
      }
      
      const result = await response.json()
      toast.success('Application submitted successfully!')
      router.push(`/application/${result.id}`)
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Applicant Details */}
        <Card>
          <CardHeader>
            <CardTitle>Section 1: Applicant Details</CardTitle>
            <CardDescription>
              Please provide your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="applicantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applicant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="10-digit mobile number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="emailId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email ID</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fullAddress"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Full Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your complete address"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 2: Faculty Supervisor Details */}
        <Card>
          <CardHeader>
            <CardTitle>Section 2: Faculty Supervisor Details</CardTitle>
            <CardDescription>
              Information about your faculty supervisor at IIT Ropar
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="facultySupervisorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Supervisor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter supervisor's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="facultyEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="faculty@iitrpr.ac.in"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Must be an @iitrpr.ac.in email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="facultyContactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="10-digit mobile number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 3: Stay Details */}
        <Card>
          <CardHeader>
            <CardTitle>Section 3: Stay Details</CardTitle>
            <CardDescription>
              Specify your intended period of stay
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="periodOfStayFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period of Stay From</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      date={field.value}
                      setDate={field.onChange}
                      placeholder="Select start date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="periodOfStayTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period of Stay To</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      date={field.value}
                      setDate={field.onChange}
                      placeholder="Select end date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dateOfArrival"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time of Arrival</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      date={field.value}
                      setDate={field.onChange}
                      showTime
                      placeholder="Select arrival date & time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dateOfDeparture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time of Departure</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      date={field.value}
                      setDate={field.onChange}
                      showTime
                      placeholder="Select departure date & time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 4: Documents & Category */}
        <Card>
          <CardHeader>
            <CardTitle>Section 4: Documents & Category</CardTitle>
            <CardDescription>
              Upload required documents and select your category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Offer Letter <span className="text-destructive">*</span>
                </label>
                <FileUpload
                  label="Offer Letter"
                  value={offerLetter}
                  onChange={(file) => {
                    setOfferLetter(file)
                    setFileErrors((prev) => ({ ...prev, offerLetter: '' }))
                  }}
                  error={fileErrors.offerLetter}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  ID Proof <span className="text-destructive">*</span>
                </label>
                <FileUpload
                  label="ID Proof"
                  value={idProof}
                  onChange={(file) => {
                    setIdProof(file)
                    setFileErrors((prev) => ({ ...prev, idProof: '' }))
                  }}
                  error={fileErrors.idProof}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="hostelRentCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hostel Rent Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HOSTEL_RENT_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}: {category.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {categoryInfo && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <h4 className="font-semibold">{categoryInfo.label}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {categoryInfo.description}
                </p>
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span className="font-medium">{categoryInfo.rate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit:</span>
                    <span className="font-medium">{categoryInfo.deposit}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 5: Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Section 5: Additional Information</CardTitle>
            <CardDescription>
              Any additional remarks or information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional remarks..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Section 6: Declaration & Signature */}
        <Card>
          <CardHeader>
            <CardTitle>Section 6: Declaration & Signature</CardTitle>
            <CardDescription>
              Review and sign your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to follow hostel rules and vacate the room when
                      required by Hostel Management.
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="applicantSignature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applicant Digital Signature</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type your full name as signature"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Type your full name to serve as your digital signature
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting && <Spinner className="mr-2" />}
            Submit Application
          </Button>
        </div>
      </form>
    </Form>
  )
}
