# NOC Management System

A modern No Objection Certificate (NOC) management system built with Next.js, featuring OTP-based authentication, role-based access control, and a multi-stage approval workflow.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** OTP-based (Email verification)
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS 4
- **Package Manager:** pnpm

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **pnpm** 8.x or higher ([Install guide](https://pnpm.io/installation))
- **PostgreSQL** 14.x or higher ([Install guide](https://www.postgresql.org/download/))

```bash
# Install pnpm if not already installed
npm install -g pnpm
```

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd b_QGokRn2CgPb-1772823923968

# Install dependencies
pnpm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and configure the following:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/noc_db?schema=public"

# Email Configuration (Required for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password    # Use Gmail App Password
SMTP_FROM=your-email@gmail.com

# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
DEV_MODE=false                     # Set to true to bypass OTP in development
OTP_EXPIRY_MINUTES=5
DEFAULT_ADMIN_EMAIL=admin@iitrpr.ac.in
```

#### PostgreSQL Setup

```bash
# Create database (run in psql or pgAdmin)
createdb noc_db

# Or using psql
psql -U postgres -c "CREATE DATABASE noc_db;"
```

Update `DATABASE_URL` in `.env` with your PostgreSQL credentials:
- `username`: Your PostgreSQL username (default: `postgres`)
- `password`: Your PostgreSQL password
- `localhost:5432`: Host and port (default PostgreSQL port is 5432)
- `noc_db`: Database name

#### Gmail App Password Setup

If using Gmail for SMTP:
1. Enable 2-Factor Authentication on your Google account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for "Mail"
4. Use this password as `SMTP_PASSWORD`

### 3. Set Up Database

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev --name init

# (Optional) View database with Prisma Studio
pnpm prisma studio
```

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at **http://localhost:3000**

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm prisma studio` | Open Prisma database viewer |
| `pnpm prisma migrate dev` | Run database migrations |
| `pnpm prisma generate` | Generate Prisma client |

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/              # Admin dashboard
│   ├── applicant/          # Applicant dashboard
│   ├── workflow/           # Workflow dashboard
│   ├── auth/               # Authentication pages
│   └── api/                # API routes
│       ├── admin/          # Admin APIs
│       ├── auth/           # Auth APIs (OTP, session)
│       └── noc/            # NOC APIs
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── admin/              # Admin-specific components
│   └── applicant/          # Applicant components
├── lib/                    # Utility functions
│   ├── auth.ts             # Authentication helpers
│   ├── db.ts               # Database client
│   ├── email.ts            # Email/OTP utilities
│   └── session.ts          # Session management
├── prisma/
│   └── schema.prisma       # Database schema
├── hooks/                  # Custom React hooks
└── scripts/                # Setup scripts
```

## User Roles

| Role | Description |
|------|-------------|
| `APPLICANT` | Submit and track NOC requests |
| `REGISTRAR` | First level approval |
| `JOINT_REGISTRAR` | Second level approval |
| `ESTABLISHMENT_1` | Establishment section approval |
| `ESTABLISHMENT_2` | Establishment section approval |
| `ADMIN` | User management and system administration |

## Authentication Flow

1. User enters email on login page
2. OTP is sent to the email address
3. User enters OTP to verify
4. Session is created upon successful verification

**Development Mode:** Set `DEV_MODE=true` in `.env` to bypass OTP verification during development.

## NOC Workflow

1. **DRAFT** → Applicant creates request
2. **SUBMITTED** → Application submitted for review
3. **PENDING_REGISTRAR** → Awaiting Registrar approval
4. **PENDING_JOINT_REGISTRAR** → Awaiting Joint Registrar approval
5. **PENDING_ESTABLISHMENT** → Awaiting Establishment approval
6. **APPROVED/REJECTED** → Final decision
7. **COMPLETED** → Process completed with digital signatures

## Troubleshooting

### Common Issues

**Database errors:**
```bash
# Reset the database
pnpm prisma migrate reset

# Regenerate Prisma client
pnpm prisma generate
```

**Port already in use:**
```bash
# Use a different port
pnpm dev -- -p 3001
```

**Email/OTP not working:**
- Verify SMTP credentials in `.env`
- Check spam folder
- Enable `DEV_MODE=true` for testing without email

## Production Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

For production, consider:
- Using a managed PostgreSQL service (e.g., Supabase, Neon, Railway)
- Setting proper `JWT_SECRET` in environment
- Configuring a production SMTP service
- Setting `NODE_ENV=production`

## License

Private project - All rights reserved.
