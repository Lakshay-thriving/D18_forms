# IIT Ropar Hostel Accommodation System - Setup Guide

A web application for managing hostel accommodation requests for interns at IIT Ropar with multi-level approval workflow.

## Tech Stack

- **Frontend:** Next.js 15 (App Router)
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (local)
- **ORM:** Prisma
- **Authentication:** Email OTP via Gmail SMTP
- **Styling:** Tailwind CSS + shadcn/ui

## Prerequisites

- Node.js 18+ 
- PostgreSQL installed and running locally
- Gmail account with App Password enabled

## Environment Variables

Create a `.env` file in the root directory:

```env
# PostgreSQL Database URL
DATABASE_URL="postgresql://username:password@localhost:5432/hostel_accommodation"

# JWT Secret for session tokens (generate a random string)
JWT_SECRET="your-super-secret-jwt-key-here"

# Gmail SMTP Configuration
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-gmail-app-password"
```

### Getting Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and your device
5. Click "Generate" and copy the 16-character password
6. Use this as your `SMTP_PASSWORD`

## Installation

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up PostgreSQL Database

Create a new database:

```bash
psql -U postgres
CREATE DATABASE hostel_accommodation;
\q
```

### 3. Run Prisma Migrations

```bash
npx prisma migrate dev --name init
```

### 4. Seed the Database

Run the seed script to create test users for all roles:

```bash
npx prisma db seed
```

Or manually insert users via SQL:

```sql
-- Insert test users for each role
INSERT INTO "User" (id, email, name, role, department, "createdAt", "updatedAt") VALUES
-- Applicants
('app1', 'applicant1@example.com', 'John Doe', 'APPLICANT', NULL, NOW(), NOW()),
('app2', 'applicant2@example.com', 'Jane Smith', 'APPLICANT', NULL, NOW(), NOW()),

-- Faculty Mentors
('fac1', 'faculty.cse@iitrpr.ac.in', 'Dr. Amit Kumar', 'FACULTY_MENTOR', 'CSE', NOW(), NOW()),
('fac2', 'faculty.ee@iitrpr.ac.in', 'Dr. Priya Sharma', 'FACULTY_MENTOR', 'EE', NOW(), NOW()),
('fac3', 'faculty.me@iitrpr.ac.in', 'Dr. Rajesh Singh', 'FACULTY_MENTOR', 'ME', NOW(), NOW()),

-- HODs (one per department)
('hod1', 'hod.cse@iitrpr.ac.in', 'Prof. Sanjay Gupta', 'HOD', 'CSE', NOW(), NOW()),
('hod2', 'hod.ee@iitrpr.ac.in', 'Prof. Meera Patel', 'HOD', 'EE', NOW(), NOW()),
('hod3', 'hod.me@iitrpr.ac.in', 'Prof. Vikram Rao', 'HOD', 'ME', NOW(), NOW()),

-- Junior Superintendent
('js1', 'js.hostel@iitrpr.ac.in', 'Mr. Suresh Kumar', 'JUNIOR_SUPERINTENDENT', NULL, NOW(), NOW()),

-- Assistant Registrar
('ar1', 'ar.academic@iitrpr.ac.in', 'Mr. Ramesh Verma', 'ASSISTANT_REGISTRAR', NULL, NOW(), NOW()),

-- Chief Warden
('cw1', 'chief.warden@iitrpr.ac.in', 'Prof. Anil Sharma', 'CHIEF_WARDEN', NULL, NOW(), NOW());
```

### 5. Start the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Application Workflow

### User Roles

1. **Applicant (Intern)** - Submits hostel accommodation requests
2. **Faculty Mentor** - First level approval
3. **HOD** - Second level approval (same department as Faculty Mentor)
4. **Junior Superintendent** - Third level approval
5. **Assistant Registrar** - Fourth level approval
6. **Chief Warden** - Final approval

### Approval Flow

```
Applicant → Faculty Mentor → HOD → Junior Superintendent → Assistant Registrar → Chief Warden
```

### Application States

- `DRAFT` - Application created but not submitted
- `SUBMITTED` - Submitted, waiting for Faculty Mentor approval
- `FACULTY_APPROVED` - Approved by Faculty Mentor, waiting for HOD
- `HOD_APPROVED` - Approved by HOD, waiting for Junior Superintendent
- `JS_APPROVED` - Approved by JS, waiting for Assistant Registrar
- `AR_APPROVED` - Approved by AR, waiting for Chief Warden
- `APPROVED` - Final approval by Chief Warden
- `REJECTED` - Rejected at any stage

## Features

### For Applicants
- Create and submit accommodation applications
- Upload required documents (ID proof, Institute ID, Photo)
- Track application status
- View approval history
- Receive email notifications on final approval/rejection

### For Stakeholders (Approvers)
- View pending applications requiring their approval
- View all previously approved applications
- See uploaded documents for verification
- View previous stakeholder approvals and remarks
- Approve or reject with remarks

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and create session
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - Logout

### Applications
- `GET /api/applications` - List applications (filtered by role)
- `POST /api/applications` - Create new application
- `GET /api/applications/[id]` - Get application details
- `PUT /api/applications/[id]` - Update application
- `POST /api/applications/[id]/submit` - Submit application
- `POST /api/applications/[id]/approve` - Approve/reject application
- `POST /api/applications/[id]/documents` - Upload documents
- `GET /api/applications/[id]/documents` - Get documents

### Users
- `GET /api/users/faculty` - List all faculty mentors

## Database Schema

### Main Tables

- **User** - All system users with roles
- **Application** - Hostel accommodation applications
- **Document** - Uploaded documents for applications
- **Approval** - Approval history for each application
- **OTP** - Temporary OTP storage for authentication

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Ensure PostgreSQL is running
   - Verify DATABASE_URL in .env file
   - Check username/password are correct

2. **OTP email not received**
   - Verify SMTP_USER and SMTP_PASSWORD
   - Check Gmail App Password is correct
   - Ensure 2FA is enabled on Gmail account

3. **Prisma errors**
   - Run `npx prisma generate` to regenerate client
   - Run `npx prisma migrate reset` to reset database

### Reset Database

```bash
npx prisma migrate reset
```

This will drop all tables and re-run migrations.

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a managed PostgreSQL service (e.g., Supabase, Neon, AWS RDS)
3. Update DATABASE_URL to production database
4. Generate a strong JWT_SECRET
5. Consider using a transactional email service (e.g., SendGrid, Resend)

## License

Internal use only - IIT Ropar
