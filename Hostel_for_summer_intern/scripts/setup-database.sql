-- IIT Ropar Hostel Accommodation System Database Setup

-- Create enum types
CREATE TYPE user_role AS ENUM (
  'APPLICANT',
  'FACULTY_MENTOR',
  'HOD',
  'JUNIOR_SUPERINTENDENT',
  'ASSISTANT_REGISTRAR',
  'CHIEF_WARDEN'
);

CREATE TYPE gender AS ENUM ('MALE', 'FEMALE');

CREATE TYPE application_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'FACULTY_APPROVED',
  'FACULTY_REJECTED',
  'HOD_APPROVED',
  'HOD_REJECTED',
  'JS_REVIEWED',
  'JS_SENT_BACK',
  'HOSTEL_ALLOCATED',
  'AR_APPROVED',
  'AR_REJECTED',
  'CHIEF_WARDEN_APPROVED',
  'CHIEF_WARDEN_REJECTED',
  'COMPLETED'
);

CREATE TYPE hostel_category AS ENUM ('CATEGORY_A', 'CATEGORY_B');

CREATE TYPE department AS ENUM (
  'COMPUTER_SCIENCE',
  'ELECTRICAL_ENGINEERING',
  'MECHANICAL_ENGINEERING',
  'CIVIL_ENGINEERING',
  'CHEMICAL_ENGINEERING',
  'BIOMEDICAL_ENGINEERING',
  'MATHEMATICS',
  'PHYSICS',
  'CHEMISTRY',
  'HUMANITIES'
);

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL,
  department department,
  "contactNumber" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create OtpSession table
CREATE TABLE IF NOT EXISTS "OtpSession" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  otp TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create Application table
CREATE TABLE IF NOT EXISTS "Application" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "applicantId" TEXT NOT NULL REFERENCES "User"(id),
  "applicantName" TEXT NOT NULL,
  gender gender NOT NULL,
  affiliation TEXT NOT NULL,
  "fullAddress" TEXT NOT NULL,
  "contactNumber" TEXT NOT NULL,
  "applicantEmail" TEXT NOT NULL,
  "facultyMentorName" TEXT NOT NULL,
  "facultyMentorEmail" TEXT NOT NULL,
  "facultyMentorContact" TEXT NOT NULL,
  "facultyMentorId" TEXT,
  "internshipStartDate" TIMESTAMP NOT NULL,
  "internshipEndDate" TIMESTAMP NOT NULL,
  "arrivalDate" TIMESTAMP NOT NULL,
  "departureDate" TIMESTAMP NOT NULL,
  "financialSupport" DOUBLE PRECISION DEFAULT 0,
  "hostelCategory" hostel_category NOT NULL,
  "allocatedHostel" TEXT,
  "allocatedRoom" TEXT,
  status application_status DEFAULT 'DRAFT',
  remarks TEXT,
  "declarationAccepted" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "submittedAt" TIMESTAMP
);

-- Create Document table
CREATE TABLE IF NOT EXISTS "Document" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "applicationId" TEXT NOT NULL REFERENCES "Application"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  "uploadedAt" TIMESTAMP DEFAULT NOW()
);

-- Create ApprovalAction table
CREATE TABLE IF NOT EXISTS "ApprovalAction" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "applicationId" TEXT NOT NULL REFERENCES "Application"(id) ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"(id),
  role user_role NOT NULL,
  action TEXT NOT NULL,
  remarks TEXT,
  signature TEXT,
  "allocatedHostel" TEXT,
  "allocatedRoom" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);
CREATE INDEX IF NOT EXISTS idx_user_department ON "User"(department);
CREATE INDEX IF NOT EXISTS idx_otp_user ON "OtpSession"("userId");
CREATE INDEX IF NOT EXISTS idx_application_applicant ON "Application"("applicantId");
CREATE INDEX IF NOT EXISTS idx_application_status ON "Application"(status);
CREATE INDEX IF NOT EXISTS idx_application_faculty ON "Application"("facultyMentorEmail");
CREATE INDEX IF NOT EXISTS idx_document_application ON "Document"("applicationId");
CREATE INDEX IF NOT EXISTS idx_approval_application ON "ApprovalAction"("applicationId");
CREATE INDEX IF NOT EXISTS idx_approval_user ON "ApprovalAction"("userId");

-- Insert sample stakeholder users for testing
INSERT INTO "User" (id, email, name, role, department, "contactNumber") VALUES
  ('faculty-1', '2023csb1167+1@iitrpr.ac.in', 'Dr. Rajesh Kumar', 'FACULTY_MENTOR', 'COMPUTER_SCIENCE', '9876543210'),
  ('faculty-2', '2023csb1167+2@iitrpr.ac.in', 'Dr. Priya Sharma', 'FACULTY_MENTOR', 'ELECTRICAL_ENGINEERING', '9876543211'),
  ('hod-cs', '2023csb1167+3@iitrpr.ac.in', 'Prof. Amit Singh', 'HOD', 'COMPUTER_SCIENCE', '9876543212'),
  ('hod-ee', '2023csb1167+4@iitrpr.ac.in', 'Prof. Sunita Verma', 'HOD', 'ELECTRICAL_ENGINEERING', '9876543213'),
  ('js-1', '2023csb1167+5@iitrpr.ac.in', 'Mr. Rakesh Gupta', 'JUNIOR_SUPERINTENDENT', NULL, '9876543214'),
  ('ar-1', '2023csb1167+6@iitrpr.ac.in', 'Mrs. Meena Kapoor', 'ASSISTANT_REGISTRAR', NULL, '9876543215'),
  ('cw-1', '2023csb1167+7@iitrpr.ac.in', 'Prof. Vikram Patel', 'CHIEF_WARDEN', NULL, '9876543216')
ON CONFLICT (email) DO NOTHING;
