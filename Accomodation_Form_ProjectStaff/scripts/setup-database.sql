-- IIT Ropar Hostel Allocation System Database Setup
-- Run this script to create the required tables in PostgreSQL

-- Create enums
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

CREATE TYPE "ApplicationStatus" AS ENUM (
  'SUBMITTED',
  'PENDING_FACULTY_APPROVAL',
  'PENDING_HOD_RECOMMENDATION',
  'PENDING_HOSTEL_REVIEW',
  'SENT_BACK_TO_APPLICANT',
  'PENDING_ALLOCATION',
  'PENDING_AR_APPROVAL',
  'PENDING_CHIEF_WARDEN_APPROVAL',
  'COMPLETED',
  'REJECTED'
);

CREATE TYPE "HostelRentCategory" AS ENUM ('CATEGORY_A', 'CATEGORY_B');

CREATE TYPE "Hostel" AS ENUM (
  'BRAHMAPUTRA_BOYS',
  'CHENAB',
  'BEAS',
  'SATLUJ',
  'BRAHMAPUTRA_GIRLS',
  'RAAVI'
);

CREATE TYPE "ApprovalRole" AS ENUM (
  'FACULTY_SUPERVISOR',
  'HOD',
  'JUNIOR_SUPERINTENDENT',
  'ASSISTANT_REGISTRAR',
  'CHIEF_WARDEN'
);

CREATE TYPE "ApprovalAction" AS ENUM (
  'APPROVED',
  'REJECTED',
  'RECOMMENDED',
  'SENT_BACK',
  'PROCEED_TO_ALLOCATION'
);

-- Create Application table
CREATE TABLE "Application" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "applicantName" TEXT NOT NULL,
  "gender" "Gender" NOT NULL,
  "department" TEXT NOT NULL,
  "fullAddress" TEXT NOT NULL,
  "contactNumber" TEXT NOT NULL,
  "emailId" TEXT NOT NULL,
  "facultySupervisorName" TEXT NOT NULL,
  "facultyEmail" TEXT NOT NULL,
  "facultyContactNumber" TEXT NOT NULL,
  "periodOfStayFrom" TIMESTAMP(3) NOT NULL,
  "periodOfStayTo" TIMESTAMP(3) NOT NULL,
  "dateOfArrival" TIMESTAMP(3) NOT NULL,
  "dateOfDeparture" TIMESTAMP(3) NOT NULL,
  "offerLetterUrl" TEXT NOT NULL,
  "idProofUrl" TEXT NOT NULL,
  "hostelRentCategory" "HostelRentCategory" NOT NULL,
  "remarks" TEXT,
  "applicantSignature" TEXT NOT NULL,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING_FACULTY_APPROVAL',
  "allocatedHostel" "Hostel",
  "allocatedRoomNumber" TEXT,

  CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- Create Approval table
CREATE TABLE "Approval" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "applicationId" TEXT NOT NULL,
  "role" "ApprovalRole" NOT NULL,
  "action" "ApprovalAction" NOT NULL,
  "remarks" TEXT,
  "signature" TEXT NOT NULL,

  CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- Create User table
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" "ApprovalRole" NOT NULL,
  "department" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create OTP table
CREATE TABLE "OTP" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "used" BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- Create Session table
CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "Application_status_idx" ON "Application"("status");
CREATE INDEX "Application_emailId_idx" ON "Application"("emailId");
CREATE INDEX "Approval_applicationId_idx" ON "Approval"("applicationId");
CREATE INDEX "Approval_role_idx" ON "Approval"("role");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "OTP_email_idx" ON "OTP"("email");
CREATE INDEX "OTP_code_idx" ON "OTP"("code");
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_token_idx" ON "Session"("token");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- Add foreign key constraints
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_applicationId_fkey" 
  FOREIGN KEY ("applicationId") REFERENCES "Application"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert demo users for testing
-- These are sample stakeholder accounts. In production, replace with actual IIT Ropar emails.
INSERT INTO "User" ("id", "email", "name", "role", "department") VALUES
  ('usr_faculty_1', '2023csb1156+f1@iitrpr.ac.in', 'Dr. Rajesh Kumar', 'FACULTY_SUPERVISOR', 'Computer Science and Engineering'),
  ('usr_faculty_2', '2023csb1156+f2@iitrpr.ac.in', 'Dr. Priya Sharma', 'FACULTY_SUPERVISOR', 'Electrical Engineering'),
  ('usr_hod_cse', '2023csb1156+h1@iitrpr.ac.in', 'Prof. Amit Singh', 'HOD', 'Computer Science and Engineering'),
  ('usr_hod_ee', '2023csb1156+h2@iitrpr.ac.in', 'Prof. Sunita Verma', 'HOD', 'Electrical Engineering'),
  ('usr_js', '2023csb1156+j@iitrpr.ac.in', 'Mr. Vikram Patel', 'JUNIOR_SUPERINTENDENT', NULL),
  ('usr_ar', '2023csb1156+a@iitrpr.ac.in', 'Mr. Suresh Reddy', 'ASSISTANT_REGISTRAR', NULL),
  ('usr_cw', '2023csb1156+c@iitrpr.ac.in', 'Prof. Anand Gupta', 'CHIEF_WARDEN', NULL);
