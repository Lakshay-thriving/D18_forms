// List of all departments at IIT Ropar
export const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Humanities and Social Sciences',
  'Management Studies',
] as const

export type Department = (typeof DEPARTMENTS)[number]

export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
  value: dept,
  label: dept,
}))
