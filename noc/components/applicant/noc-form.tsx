'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface NOCFormProps {
  onSuccess?: (requestId: string) => void
}

export default function NOCForm({ onSuccess }: NOCFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    purpose: '',
    certificateType: 'NO_OBJECTION' as const,
    applicantType: 'FACULTY' as const,
    passportType: 'NON_PASSPORT' as const,
    presentAddress: '',
    permanentAddress: '',
    designation: '',
    department: '',
    employeeCode: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateAndSubmit = async () => {
    if (!formData.purpose || !formData.presentAddress || !formData.designation || !formData.department) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      // Create NOC request
      const createResponse = await fetch('/api/noc/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!createResponse.ok) {
        const data = await createResponse.json()
        throw new Error(data.error || 'Failed to create NOC request')
      }

      const createData = await createResponse.json()
      const requestId = createData.requestId

      // Submit NOC request
      const submitResponse = await fetch('/api/noc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      })

      if (!submitResponse.ok) {
        const data = await submitResponse.json()
        throw new Error(data.error || 'Failed to submit NOC request')
      }

      toast.success('NOC request submitted successfully')
      
      if (onSuccess) {
        onSuccess(requestId)
      } else {
        router.push('/applicant/dashboard')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit form')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Step {step} of 3</span>
          <span className="text-xs text-secondary font-medium">{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Steps */}
      <div className="space-y-6">
        {/* Step 1: Request Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Request Details</h2>

            <div>
              <label className="text-sm font-medium block mb-2">Purpose of Certificate</label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                placeholder="Describe the purpose for which you need this certificate"
                className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-foreground min-h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Certificate Type</label>
                <select
                  name="certificateType"
                  value={formData.certificateType}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="NO_OBJECTION">No Objection</option>
                  <option value="RESIDENCE_PROOF">Residence Proof</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Passport Required</label>
                <select
                  name="passportType"
                  value={formData.passportType}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="NON_PASSPORT">Non-Passport</option>
                  <option value="PASSPORT">Passport</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2 px-4 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Personal Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Applicant Type</label>
                <select
                  name="applicantType"
                  value={formData.applicantType}
                  onChange={handleInputChange}
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  <option value="FACULTY">Faculty</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Employee Code</label>
                <input
                  type="text"
                  name="employeeCode"
                  value={formData.employeeCode}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="e.g., Assistant Professor"
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g., CSE"
                  className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2 px-4 border border-black/10 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2 px-4 rounded-full bg-foreground text-background font-medium hover:opacity-90 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Address Information */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Address Information</h2>

            <div>
              <label className="text-sm font-medium block mb-2">Present Address</label>
              <textarea
                name="presentAddress"
                value={formData.presentAddress}
                onChange={handleInputChange}
                placeholder="Enter your present address"
                className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-foreground min-h-20"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Permanent Address (Optional)</label>
              <textarea
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleInputChange}
                placeholder="Enter your permanent address (optional)"
                className="w-full bg-background border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-foreground placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-foreground min-h-20"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2 px-4 border border-black/10 dark:border-white/10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleCreateAndSubmit}
                disabled={loading}
                className="flex-1 py-2 px-4 rounded-full bg-foreground text-background font-medium hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
