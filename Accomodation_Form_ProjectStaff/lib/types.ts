export const MALE_HOSTELS = [
  { value: 'BRAHMAPUTRA_BOYS', label: 'Brahmaputra Boys' },
  { value: 'CHENAB', label: 'Chenab' },
  { value: 'BEAS', label: 'Beas' },
  { value: 'SATLUJ', label: 'Satluj' },
] as const

export const FEMALE_HOSTELS = [
  { value: 'BRAHMAPUTRA_GIRLS', label: 'Brahmaputra Girls' },
  { value: 'RAAVI', label: 'Raavi' },
] as const

export const HOSTEL_RENT_CATEGORIES = [
  {
    value: 'CATEGORY_A',
    label: 'Category A',
    description: 'Project Staff / JRF / SRF / RA / Post Docs',
    rate: '₹200/day (Max ₹4000/month)',
    deposit: '₹10,000',
  },
  {
    value: 'CATEGORY_B',
    label: 'Category B',
    description: 'Visiting Scholars / Others',
    rate: '₹150/day (Max ₹3000/month)',
    deposit: '₹10,000',
  },
] as const

export const APPLICATION_STATUS_LABELS: Record<string, { label: string; step: number }> = {
  SUBMITTED: { label: 'Submitted', step: 1 },
  PENDING_FACULTY_APPROVAL: { label: 'Faculty Approval', step: 2 },
  PENDING_HOD_RECOMMENDATION: { label: 'HOD Recommendation', step: 3 },
  PENDING_HOSTEL_REVIEW: { label: 'Hostel Review', step: 4 },
  SENT_BACK_TO_APPLICANT: { label: 'Sent Back to Applicant', step: 4 },
  PENDING_ALLOCATION: { label: 'Allocation', step: 5 },
  PENDING_AR_APPROVAL: { label: 'Assistant Registrar Approval', step: 6 },
  PENDING_CHIEF_WARDEN_APPROVAL: { label: 'Chief Warden Approval', step: 7 },
  COMPLETED: { label: 'Completed', step: 8 },
  REJECTED: { label: 'Rejected', step: -1 },
}

export const APPROVAL_STEPS = [
  { step: 1, label: 'Submitted' },
  { step: 2, label: 'Faculty Approval' },
  { step: 3, label: 'HOD Recommendation' },
  { step: 4, label: 'Hostel Review' },
  { step: 5, label: 'Allocation' },
  { step: 6, label: 'AR Approval' },
  { step: 7, label: 'Chief Warden' },
  { step: 8, label: 'Completed' },
]
