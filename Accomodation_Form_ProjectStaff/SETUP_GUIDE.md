# IIT Ropar Hostel Allocation System - Setup Guide

## Overview

This is a complete hostel allocation management system with:
- **Applicant Registration & Login** - Create an account and submit applications
- **Role-Based Dashboards** - Different interfaces for each stakeholder
- **Email-Based OTP Authentication** - Secure login via SMTP
- **Approval Workflow** - Multi-stage approval process
- **Hostel Allocation** - Assign hostels to approved applicants
v
## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (local or cloud-based like Neon)
- SMTP server credentials for sending emails

## Database Setup

### Option 1: Local PostgreSQL

```bash
# Install PostgreSQL if not already installed
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
# Windows: Download from https://www.postgresql.org/download/

# Start PostgreSQL service
# macOS/Linux: brew services start postgresql
# Windows: Services → Start PostgreSQL

# Create the database
createdb hostel_allocation

# Note the connection string format:
# postgresql://postgres:YOUR_PASSWORD@localhost:5432/hostel_allocation
```

### Option 2: Cloud PostgreSQL (Neon)

1. Go to https://console.neon.tech
2. Create a new project
3. Copy the connection string from the dashboard
4. Format: `postgresql://user:password@endpoint.neon.tech/database_name`

## Environment Variables Setup

Create a `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"

# SMTP Configuration (Email OTP)
SMTP_HOST="smtp.gmail.com"                    # or your SMTP server
SMTP_PORT="587"                               # 587 for TLS, 465 for SSL
SMTP_USER="your-email@gmail.com"              # SMTP username
SMTP_PASSWORD="your-app-password"             # SMTP password (NOT your main password)
SMTP_SECURE="false"                           # false for port 587, true for 465
SMTP_FROM_EMAIL="your-email@gmail.com"        # Email to send from
```

## SMTP Provider Setup Guide

### Gmail SMTP

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Generate password
3. Use the generated password in `SMTP_PASSWORD`

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="aaaa bbbb cccc dddd"  # Generated app password
SMTP_SECURE="false"
SMTP_FROM_EMAIL="your-email@gmail.com"
```

### Outlook/Microsoft 365

```env
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASSWORD="your-password"
SMTP_SECURE="false"
SMTP_FROM_EMAIL="your-email@outlook.com"
```

### SendGrid SMTP

1. Create account at https://sendgrid.com
2. Generate API key
3. Create SMTP credentials:

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxxxxxxxxxxxx"  # Your API key
SMTP_SECURE="false"
SMTP_FROM_EMAIL="noreply@yourdomain.com"
```

### AWS SES (Simple Email Service)

```env
SMTP_HOST="email-smtp.REGION.amazonaws.com"  # e.g., us-east-1
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
SMTP_SECURE="false"
SMTP_FROM_EMAIL="verified-email@yourdomain.com"
```

### MailGun

```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@yourdomain.com"
SMTP_PASSWORD="your-smtp-password"
SMTP_SECURE="false"
SMTP_FROM_EMAIL="no-reply@yourdomain.com"
```

## Installation & Running

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env.local file with your database and SMTP credentials
# (See environment variables section above)

# 3. Push database schema
npx prisma db push

# 4. (Optional) Seed demo data
# Uncomment the demo users section in setup-database.sql
# Then run: psql -U postgres -d hostel_allocation -f scripts/setup-database.sql

# 5. Start development server
pnpm dev

# Open http://localhost:3000 in your browser
```

## User Roles & Access

### 1. **Applicant**
- Create account and submit hostel allocation applications
- Track application status through all approval stages
- View allocated hostel details
- Dashboard: `/applicant/dashboard`

### 2. **Faculty Supervisor**
- Review applications from assigned applicants
- Approve or reject applications with remarks
- Dashboard: `/dashboard/faculty`

### 3. **Head of Department (HOD)**
- Recommend applications by department
- Send applications back for revision
- Dashboard: `/dashboard/hod`

### 4. **Junior Superintendent**
- Review applications
- Allocate hostels (with gender-specific options)
- Send applications back to applicants
- Dashboard: `/dashboard/junior-superintendent`

### 5. **Assistant Registrar**
- Approve/reject hostel allocations
- Dashboard: `/dashboard/assistant-registrar`

### 6. **Chief Warden**
- Final approval authority
- Complete or reject applications
- Dashboard: `/dashboard/chief-warden`

## Testing with Demo Data

### Demo Stakeholder Accounts

The following accounts have been pre-created for testing:

```
Email: faculty@iitrpr.ac.in
Role: Faculty Supervisor

Email: hod.cse@iitrpr.ac.in
Role: Head of Department (Computer Science)

Email: js.hostel@iitrpr.ac.in
Role: Junior Superintendent

Email: ar.hostel@iitrpr.ac.in
Role: Assistant Registrar

Email: chiefwarden@iitrpr.ac.in
Role: Chief Warden
```

### Testing Login

1. Go to http://localhost:3000/auth
2. Click "Login" tab
3. Enter any demo email above
4. Click "Send OTP"
   - **Demo Mode**: OTP will be displayed on screen (for testing without SMTP)
   - **Production**: OTP will be sent via email
5. Enter the OTP and click "Verify & Login"

### Creating New Applicant Account

1. Go to http://localhost:3000/auth
2. Click "Sign Up" tab
3. Enter your name and email
4. Click "Create Account"
5. Enter the OTP sent to your email
6. You'll be redirected to `/applicant/dashboard`

## Approval Workflow Stages

Applications go through these stages:

1. **SUBMITTED** - Applicant submits application
2. **PENDING_FACULTY_APPROVAL** - Waiting for Faculty Supervisor approval
3. **PENDING_HOD_RECOMMENDATION** - Waiting for HOD recommendation
4. **PENDING_HOSTEL_REVIEW** - Waiting for JS hostel review
5. **PENDING_ALLOCATION** - JS allocates hostel
6. **PENDING_AR_APPROVAL** - Waiting for Assistant Registrar approval
7. **PENDING_CHIEF_WARDEN_APPROVAL** - Waiting for Chief Warden approval
8. **COMPLETED** - Application approved and hostel allocated
9. **REJECTED** - Application rejected at any stage
10. **SENT_BACK_TO_APPLICANT** - Requires revision by applicant

## Troubleshooting

### SMTP Connection Failed
- Verify credentials in `.env.local`
- Check firewall/antivirus isn't blocking SMTP port
- For Gmail, ensure App Password is used (not main password)
- For production, disable "Less secure app access" alternative using App Passwords

### Database Connection Error
- Verify `DATABASE_URL` format
- Check PostgreSQL service is running
- Confirm database exists: `createdb hostel_allocation`
- For Neon, verify network access isn't restricted

### OTP Not Received
- Check spam/junk folder
- Verify `SMTP_FROM_EMAIL` is correct
- Check email logs in SMTP provider dashboard
- Try resending OTP from the interface

### Prisma Schema Out of Sync
```bash
# Regenerate Prisma client
npx prisma generate

# If schema changed, push to database
npx prisma db push
```

## Production Deployment

### Environment Variables for Production

Set these in your hosting provider (Vercel, etc.):

```
DATABASE_URL=postgresql://...
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-password
SMTP_SECURE=false
SMTP_FROM_EMAIL=noreply@domain.com
NODE_ENV=production
```

### Security Considerations

1. Never commit `.env.local` to git (already in `.gitignore`)
2. Use strong, unique SMTP passwords
3. Enable database backups
4. Use HTTPS for all connections
5. Rotate credentials regularly
6. Set up monitoring and alerts

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new applicant account
- `POST /api/auth/send-otp` - Send OTP via email
- `POST /api/auth/verify-otp` - Verify OTP and create session
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Applications
- `POST /api/applications` - Submit new application
- `GET /api/applications` - Get user's applications
- `GET /api/applications/search` - Search applications
- `POST /api/applications/[id]/approve` - Submit approval/recommendation

## Support & Documentation

For issues or questions:
1. Check the troubleshooting section above
2. Review your environment variables are correctly set
3. Check application logs in the terminal
4. Consult the Prisma documentation: https://www.prisma.io/docs
5. Nodemailer docs: https://nodemailer.com/
