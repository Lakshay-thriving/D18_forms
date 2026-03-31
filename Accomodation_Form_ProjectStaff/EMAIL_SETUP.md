# Email OTP Authentication - Configuration Checklist

## Quick Start - Gmail Setup (Recommended for Testing)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Complete the verification process

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" from the first dropdown
3. Select "Windows Computer" (or your device type) from the second dropdown
4. Click "Generate"
5. Copy the generated 16-character password

### Step 3: Create .env.local File
Create a `.env.local` file in your project root with:

```env
# Database - Choose One:

# Option A: Local PostgreSQL
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/hostel_allocation"

# Option B: Neon Cloud (Recommended)
DATABASE_URL="postgresql://neon_user:neon_password@ep-xxxx.neon.tech/hostel_allocation?sslmode=require"

# Gmail SMTP Settings
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="xxxx xxxx xxxx xxxx"  # Paste the 16-character app password here
SMTP_SECURE="false"
SMTP_FROM_EMAIL="your-email@gmail.com"
```

### Step 4: Run the Application
```bash
pnpm install
npx prisma db push
pnpm dev
```

Visit http://localhost:3000/auth to test!

---

## Complete SMTP Provider Setup Guide

### Gmail
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
SMTP_SECURE="false"
SMTP_FROM_EMAIL="your-email@gmail.com"
```
**Setup**: https://myaccount.google.com/apppasswords

---

### Outlook/Microsoft 365
```env
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASSWORD="your-password"
SMTP_SECURE="false"
SMTP_FROM_EMAIL="your-email@outlook.com"
```

---

### SendGrid
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxxxxxxxxxxxxxxxxxxxx"
SMTP_SECURE="false"
SMTP_FROM_EMAIL="noreply@yourdomain.com"
```
**Setup**: https://sendgrid.com → Settings → API Keys → Create SMTP Relay

---

### AWS SES
```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="AKIAIOSFODNN7EXAMPLE"
SMTP_PASSWORD="your-smtp-password"
SMTP_SECURE="false"
SMTP_FROM_EMAIL="verified-email@yourdomain.com"
```
**Setup**: AWS Console → SES → SMTP Settings → Create credentials

---

### MailGun
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@yourdomain.com"
SMTP_PASSWORD="your-smtp-password"
SMTP_SECURE="false"
SMTP_FROM_EMAIL="no-reply@yourdomain.com"
```
**Setup**: https://mailgun.com → Sending → Domain Settings

---

### Zoho Mail
```env
SMTP_HOST="smtp.zoho.com"
SMTP_PORT="587"
SMTP_USER="your-email@zoho.com"
SMTP_PASSWORD="your-password"
SMTP_SECURE="false"
SMTP_FROM_EMAIL="your-email@zoho.com"
```

---

### YandexMail
```env
SMTP_HOST="smtp.yandex.com"
SMTP_PORT="587"
SMTP_USER="your-email@yandex.com"
SMTP_PASSWORD="your-password"
SMTP_SECURE="false"
SMTP_FROM_EMAIL="your-email@yandex.com"
```

---

## Testing Your Configuration

### 1. Check Environment Variables
```bash
# Verify .env.local is loaded
node -e "console.log(process.env.SMTP_HOST)"
```

### 2. Test Database Connection
```bash
# Check if database connection works
npx prisma db push
```

### 3. Manual Email Test
1. Go to http://localhost:3000/auth
2. Enter a stakeholder email (e.g., faculty@iitrpr.ac.in)
3. Click "Send OTP"
   - If SMTP configured: OTP sent to email (check inbox/spam)
   - If SMTP not configured: Demo OTP shown on screen
4. Check email for OTP
5. Enter OTP and verify

### 4. Check Application Logs
Watch the terminal for email sending logs:
```
[Email] SMTP connection verified
[Email] OTP sent successfully to email@example.com
```

---

## Troubleshooting

### "SMTP connection failed"
- Verify SMTP credentials in `.env.local`
- For Gmail: Use App Password, NOT your main Gmail password
- Check port is correct (587 for TLS, 465 for SSL)
- Disable firewall/antivirus temporarily to test

### "OTP not received"
- Check spam/junk folder
- Verify `SMTP_FROM_EMAIL` is correct
- For Gmail: Ensure "Less secure apps" access is enabled OR use App Password
- Try resending from the interface

### "Invalid credentials"
- Double-check username/password (no extra spaces)
- Gmail: Use the 16-character app password, not your main password
- Other providers: Verify credentials in provider's settings

### "Port 587 connection refused"
- Check if your ISP/firewall blocks SMTP
- Try port 465 with `SMTP_SECURE="true"`
- Use a VPN or try from a different network

---

## Deployment (Vercel/Production)

### 1. Set Environment Variables in Vercel Dashboard
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add all 6 SMTP variables (copy from `.env.local`)

### 2. Important Security Notes
- ✅ Never commit `.env.local` to git
- ✅ Use App Passwords for Gmail (more secure)
- ✅ Rotate credentials every 6 months
- ✅ Use different email for production
- ✅ Monitor email sending logs

---

## API Integration Notes

The OTP system automatically initializes on first use. No additional setup required in code.

### Email Sending Flow
1. User enters email → API generates OTP
2. OTP stored in database with 10-minute expiration
3. Email service sends OTP via SMTP
4. User enters OTP → API verifies and creates session
5. User is redirected to their dashboard

### Demo Mode
- If SMTP not configured, OTP is shown on screen (development only)
- This allows testing without SMTP setup
- In production, SMTP must be configured

---

## Questions?

For detailed setup instructions, see the main `SETUP_GUIDE.md` file.
