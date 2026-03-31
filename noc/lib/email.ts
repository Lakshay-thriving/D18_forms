import nodemailer from 'nodemailer'

// Create transporter based on environment
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

/**
 * Send OTP email to user
 */
export async function sendOTPEmail(email: string, otp: string, purpose: 'ADMIN_LOGIN' | 'APPLICANT_REGISTRATION' = 'ADMIN_LOGIN'): Promise<boolean> {
  try {
    const subject = purpose === 'ADMIN_LOGIN' ? 'Your OTP for NOC System Login' : 'Verify Your Email - NOC System'
    
    const htmlContent = purpose === 'ADMIN_LOGIN' 
      ? getAdminOTPEmail(email, otp)
      : getApplicantOTPEmail(email, otp)

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      html: htmlContent,
    })

    return true
  } catch (error) {
    console.error('[Email] Failed to send OTP:', error)
    return false
  }
}

/**
 * Send NOC approval notification
 */
export async function sendNOCNotification(
  email: string,
  requestId: string,
  status: 'APPROVED' | 'REJECTED' | 'PENDING',
  message?: string
): Promise<boolean> {
  try {
    const htmlContent = getNOCNotificationEmail(requestId, status, message)

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `NOC Request ${status}: ${requestId}`,
      html: htmlContent,
    })

    return true
  } catch (error) {
    console.error('[Email] Failed to send NOC notification:', error)
    return false
  }
}

/**
 * Send NOC reply/letter
 */
export async function sendNOCLetter(
  email: string,
  requestId: string,
  letterPath: string,
  certificateType: string
): Promise<boolean> {
  try {
    const htmlContent = getNOCLetterEmail(requestId, certificateType)

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Your ${certificateType} - ${requestId}`,
      html: htmlContent,
      attachments: [
        {
          filename: `NOC_${requestId}.pdf`,
          path: letterPath,
        },
      ],
    })

    return true
  } catch (error) {
    console.error('[Email] Failed to send NOC letter:', error)
    return false
  }
}

/**
 * Email template for admin OTP
 */
function getAdminOTPEmail(email: string, otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 1px solid #e5e5e5; padding-bottom: 20px; }
          .content { padding: 20px 0; }
          .otp-box { 
            background: #f5f5f5; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            margin: 20px 0;
          }
          .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            letter-spacing: 4px; 
            font-family: 'Courier New', monospace;
          }
          .footer { border-top: 1px solid #e5e5e5; padding-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>IIT Ropar NOC Management System</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your OTP for logging into the NOC System has been generated.</p>
            <div class="otp-box">
              <p>Your OTP Code:</p>
              <div class="otp-code">${otp}</div>
            </div>
            <p>This OTP is valid for 5 minutes. Do not share this with anyone.</p>
          </div>
          <div class="footer">
            <p>If you did not request this OTP, please ignore this email.</p>
            <p>Indian Institute of Technology Ropar</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Email template for applicant OTP
 */
function getApplicantOTPEmail(email: string, otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 1px solid #e5e5e5; padding-bottom: 20px; }
          .content { padding: 20px 0; }
          .otp-box { 
            background: #f5f5f5; 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            margin: 20px 0;
          }
          .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            letter-spacing: 4px; 
            font-family: 'Courier New', monospace;
          }
          .footer { border-top: 1px solid #e5e5e5; padding-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>IIT Ropar NOC Management System</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Verify your email to proceed with your NOC application.</p>
            <div class="otp-box">
              <p>Your Verification Code:</p>
              <div class="otp-code">${otp}</div>
            </div>
            <p>This code is valid for 5 minutes.</p>
          </div>
          <div class="footer">
            <p>If you did not create this account, please ignore this email.</p>
            <p>Indian Institute of Technology Ropar</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Email template for NOC status notification
 */
function getNOCNotificationEmail(requestId: string, status: string, message?: string): string {
  const statusColor = status === 'APPROVED' ? '#22c55e' : status === 'REJECTED' ? '#ef4444' : '#f59e0b'
  const statusText = status === 'APPROVED' ? 'Approved' : status === 'REJECTED' ? 'Rejected' : 'Pending Review'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 1px solid #e5e5e5; padding-bottom: 20px; }
          .content { padding: 20px 0; }
          .status-box { 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            background: ${statusColor}20;
            border-left: 4px solid ${statusColor};
          }
          .status-text { font-size: 18px; font-weight: bold; color: ${statusColor}; }
          .footer { border-top: 1px solid #e5e5e5; padding-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>NOC Request Status Update</h2>
          </div>
          <div class="content">
            <p>Request ID: <strong>${requestId}</strong></p>
            <div class="status-box">
              <div class="status-text">${statusText}</div>
              ${message ? `<p>${message}</p>` : ''}
            </div>
            <p>You will be notified when the next stage is completed.</p>
          </div>
          <div class="footer">
            <p>Indian Institute of Technology Ropar</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Email template for NOC letter
 */
function getNOCLetterEmail(requestId: string, certificateType: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { border-bottom: 1px solid #e5e5e5; padding-bottom: 20px; }
          .content { padding: 20px 0; }
          .footer { border-top: 1px solid #e5e5e5; padding-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Your Certificate is Ready</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your ${certificateType} for request <strong>${requestId}</strong> has been approved and is attached below.</p>
            <p>Please review the document carefully. If you have any questions, please contact the Registrar's office.</p>
          </div>
          <div class="footer">
            <p>Indian Institute of Technology Ropar</p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM
  )
}

/**
 * Send NOC completion email with link to view/print document
 */
export async function sendNOCCompletionEmail(
  email: string,
  requestId: string,
  applicantName?: string
): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn('[Email] Email service not configured, skipping NOC completion notification')
    return false
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const viewLink = `${appUrl}/noc/print?id=${requestId}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; text-align: center; }
            .content { padding: 30px 0; }
            .success-box { 
              background: #f0f0f0; 
              padding: 24px; 
              border-radius: 8px; 
              text-align: center; 
              margin: 20px 0;
              border: 2px solid #000;
            }
            .success-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .btn { 
              display: inline-block;
              background: #000; 
              color: #fff; 
              padding: 14px 28px; 
              text-decoration: none; 
              border-radius: 9999px;
              margin-top: 16px;
              font-weight: 500;
            }
            .request-id { font-family: monospace; font-size: 14px; color: #666; }
            .footer { border-top: 1px solid #e5e5e5; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Indian Institute of Technology Ropar</h2>
              <p>NOC Management System</p>
            </div>
            <div class="content">
              <p>Dear ${applicantName || 'Applicant'},</p>
              
              <div class="success-box">
                <div class="success-title">✓ NOC COMPLETED</div>
                <p>Your No Objection Certificate has been approved with all required signatures.</p>
                <p class="request-id">Request ID: ${requestId}</p>
                <a href="${viewLink}" class="btn">View & Print Document</a>
              </div>
              
              <p>You can now view and print your NOC document using the link above.</p>
              <p>Please keep a copy of this document for your records.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the NOC Management System.</p>
              <p>Indian Institute of Technology Ropar, Rupnagar, Punjab - 140001</p>
            </div>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `✓ NOC Completed - ${requestId}`,
      html: htmlContent,
    })

    console.log(`[Email] NOC completion email sent to ${email}`)
    return true
  } catch (error) {
    console.error('[Email] Failed to send NOC completion email:', error)
    return false
  }
}

/**
 * Send NOC status update email (for intermediate stages)
 */
export async function sendNOCStatusUpdateEmail(
  email: string,
  requestId: string,
  status: string,
  stage: string,
  isRejected: boolean = false,
  comments?: string
): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn('[Email] Email service not configured, skipping status update')
    return false
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const dashboardLink = `${appUrl}/applicant/dashboard`

    const statusMessage = isRejected 
      ? 'Your NOC request has been rejected.' 
      : `Your NOC request has progressed to: ${stage.replace(/_/g, ' ')}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 2px solid #000; padding-bottom: 20px; text-align: center; }
            .content { padding: 30px 0; }
            .status-box { 
              background: ${isRejected ? '#fef2f2' : '#f5f5f5'}; 
              padding: 20px; 
              border-radius: 8px; 
              margin: 20px 0;
              border-left: 4px solid ${isRejected ? '#dc2626' : '#000'};
            }
            .request-id { font-family: monospace; font-size: 14px; color: #666; }
            .footer { border-top: 1px solid #e5e5e5; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>NOC Request Status Update</h2>
            </div>
            <div class="content">
              <p class="request-id">Request ID: ${requestId}</p>
              
              <div class="status-box">
                <p><strong>${statusMessage}</strong></p>
                ${comments ? `<p style="margin-top: 10px; font-style: italic;">"${comments}"</p>` : ''}
              </div>
              
              <p>Track your request status on your <a href="${dashboardLink}">dashboard</a>.</p>
            </div>
            <div class="footer">
              <p>Indian Institute of Technology Ropar</p>
            </div>
          </div>
        </body>
      </html>
    `

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `NOC ${isRejected ? 'Rejected' : 'Update'} - ${requestId}`,
      html: htmlContent,
    })

    console.log(`[Email] Status update email sent to ${email}`)
    return true
  } catch (error) {
    console.error('[Email] Failed to send status update email:', error)
    return false
  }
}
