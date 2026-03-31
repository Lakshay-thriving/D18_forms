import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

export async function initializeEmailTransport() {
  // Only initialize in production or if SMTP is configured
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    console.warn(
      '[Email] SMTP credentials not configured. Email sending disabled. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD to enable.'
    )
    return null
  }

  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    })

    // Verify connection
    await transporter.verify()
    console.log('[Email] SMTP connection verified')
    return transporter
  } catch (error) {
    console.error('[Email] Failed to initialize SMTP:', error)
    return null
  }
}

export async function sendOtpEmail(email: string, otp: string, userName: string) {
  // Initialize if not already done
  if (!transporter) {
    await initializeEmailTransport()
  }

  if (!transporter) {
    console.warn('[Email] Email sending disabled - SMTP not configured')
    return false
  }

  try {
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER

    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: 'Your IIT Ropar Hostel Allocation System - One Time Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
              .otp-box { background-color: white; padding: 20px; margin: 20px 0; text-align: center; border-radius: 5px; border: 2px dashed #3b82f6; }
              .otp-code { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px; font-family: 'Courier New', monospace; }
              .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
              .warning { color: #dc2626; font-size: 12px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>IIT Ropar</h1>
                <p>Hostel Allocation System</p>
              </div>
              <div class="content">
                <p>Hello ${userName},</p>
                <p>Thank you for logging into the IIT Ropar Hostel Allocation System. Use the one-time password (OTP) below to verify your identity and complete your login.</p>
                
                <div class="otp-box">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your One-Time Password:</p>
                  <div class="otp-code">${otp}</div>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                  This OTP will expire in <strong>10 minutes</strong>. Do not share this code with anyone.
                </p>
                
                <div class="warning">
                  If you did not request this OTP, please ignore this email or contact the administrator immediately.
                </div>
              </div>
              <div class="footer">
                <p>© 2024 IIT Ropar. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        IIT Ropar - Hostel Allocation System
        
        Hello ${userName},
        
        Your One-Time Password is: ${otp}
        
        This OTP will expire in 10 minutes. Do not share this code with anyone.
        
        If you did not request this OTP, please ignore this email or contact the administrator.
        
        © 2024 IIT Ropar. All rights reserved.
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`[Email] OTP sent successfully to ${email}`)
    return true
  } catch (error) {
    console.error(`[Email] Failed to send OTP to ${email}:`, error)
    return false
  }
}

export async function sendApplicationConfirmationEmail(email: string, applicantName: string, applicationId: string) {
  // Initialize if not already done
  if (!transporter) {
    await initializeEmailTransport()
  }

  if (!transporter) {
    console.warn('[Email] Email sending disabled - SMTP not configured')
    return false
  }

  try {
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
    const trackingUrl = `${process.env.APP_URL || 'http://localhost:3000'}/track`

    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: 'Application Submitted Successfully - IIT Ropar Hostel Allocation',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
              .app-id-box { background-color: #ecfdf5; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #10b981; }
              .app-id-label { color: #059669; font-size: 12px; font-weight: bold; }
              .app-id { font-size: 20px; font-weight: bold; color: #10b981; font-family: 'Courier New', monospace; margin: 10px 0; }
              .success-badge { display: inline-block; background-color: #10b981; color: white; padding: 8px 12px; border-radius: 5px; font-weight: bold; font-size: 12px; }
              .cta-button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
              .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>IIT Ropar</h1>
                <p>Hostel Allocation System</p>
              </div>
              <div class="content">
                <p>Dear ${applicantName},</p>
                
                <p><span class="success-badge">✓ SUCCESS</span></p>
                
                <p>Your hostel allocation application has been submitted successfully! We have received your application and it is now under review by our approval team.</p>
                
                <div class="app-id-box">
                  <div class="app-id-label">YOUR APPLICATION ID:</div>
                  <div class="app-id">${applicationId}</div>
                  <p style="margin: 10px 0 0 0; color: #059669; font-size: 12px;">Please keep this ID safe for future reference and tracking.</p>
                </div>
                
                <h3 style="margin-top: 25px;">What's Next?</h3>
                <p>Your application will go through the following approval stages:</p>
                <ol>
                  <li>Faculty Supervisor Review</li>
                  <li>Head of Department (HOD) Recommendation</li>
                  <li>Hostel Management Review</li>
                  <li>Hostel Allocation</li>
                  <li>Assistant Registrar Approval</li>
                  <li>Chief Warden Final Approval</li>
                </ol>
                
                <p>You can track the progress of your application at any time using your Application ID.</p>
                
                <a href="${trackingUrl}" class="cta-button">Track My Application</a>
                
                <p style="margin-top: 25px; color: #6b7280; font-size: 13px;">
                  If you have any questions, please contact the Hostel Management office or reply to this email.
                </p>
              </div>
              <div class="footer">
                <p>© 2024 IIT Ropar. All rights reserved.</p>
                <p>This is an automated email, please do not reply directly. Contact hostel management for assistance.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        IIT Ropar - Hostel Allocation System
        
        Dear ${applicantName},
        
        SUCCESS
        
        Your hostel allocation application has been submitted successfully!
        
        YOUR APPLICATION ID: ${applicationId}
        
        Please keep this ID safe for future reference and tracking.
        
        What's Next?
        Your application will go through the following approval stages:
        1. Faculty Supervisor Review
        2. Head of Department (HOD) Recommendation
        3. Hostel Management Review
        4. Hostel Allocation
        5. Assistant Registrar Approval
        6. Chief Warden Final Approval
        
        You can track the progress of your application at: ${trackingUrl}
        
        If you have any questions, please contact the Hostel Management office.
        
        © 2024 IIT Ropar. All rights reserved.
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`[Email] Application confirmation sent successfully to ${email}`)
    return true
  } catch (error) {
    console.error(`[Email] Failed to send application confirmation to ${email}:`, error)
    return false
  }
}

export async function sendApplicationApprovalEmail(
  email: string,
  applicantName: string,
  applicationId: string,
  allocatedHostel?: string,
  roomNumber?: string
) {
  // Initialize if not already done
  if (!transporter) {
    await initializeEmailTransport()
  }

  if (!transporter) {
    console.warn('[Email] Email sending disabled - SMTP not configured')
    return false
  }

  try {
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
    const trackingUrl = `${process.env.APP_URL || 'http://localhost:3000'}/track`

    const hostelInfo = allocatedHostel
      ? `<div class="app-id-box" style="background-color: #ecfdf5; border-left-color: #10b981;">
          <p style="margin: 0; color: #059669;"><strong>Allocated Hostel:</strong> ${allocatedHostel}</p>
          ${roomNumber ? `<p style="margin: 5px 0 0 0; color: #059669;"><strong>Room Number:</strong> ${roomNumber}</p>` : ''}
         </div>`
      : ''

    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: '🎉 Hostel Allocation Approved! - IIT Ropar',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
              .success-badge { display: inline-block; background-color: #10b981; color: white; padding: 10px 15px; border-radius: 5px; font-weight: bold; font-size: 14px; }
              .app-id-box { background-color: #ecfdf5; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #10b981; }
              .cta-button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
              .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>IIT Ropar</h1>
                <p>Hostel Allocation System</p>
              </div>
              <div class="content">
                <p>Dear ${applicantName},</p>
                
                <p><span class="success-badge">✓ APPROVED</span></p>
                
                <p>Congratulations! Your hostel allocation application has been approved by the Chief Warden.</p>
                
                ${hostelInfo}
                
                <div class="app-id-box" style="background-color: #dbeafe; border-left-color: #0284c7;">
                  <p style="margin: 0; color: #0369a1;"><strong>Application ID:</strong> ${applicationId}</p>
                </div>
                
                <h3 style="margin-top: 25px;">Next Steps:</h3>
                <ul>
                  <li>Please check your allocated hostel details above</li>
                  <li>Contact the Hostel Management office for key collection</li>
                  <li>Report at the hostel on your designated date of arrival</li>
                </ul>
                
                <p style="margin-top: 25px; background-color: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
                  <strong style="color: #92400e;">Important:</strong> Please visit the hostel office with your original ID proof for final verification and key collection.
                </p>
                
                <a href="${trackingUrl}" class="cta-button">View Full Details</a>
                
                <p style="margin-top: 25px; color: #6b7280; font-size: 13px;">
                  For any queries, please contact the Hostel Management office at hostel@iitrpr.ac.in
                </p>
              </div>
              <div class="footer">
                <p>© 2024 IIT Ropar. All rights reserved.</p>
                <p>This is an automated email, please do not reply directly.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        IIT Ropar - Hostel Allocation System
        
        Dear ${applicantName},
        
        CONGRATULATIONS! Your hostel allocation has been approved!
        
        Application ID: ${applicationId}
        ${allocatedHostel ? `Allocated Hostel: ${allocatedHostel}` : ''}
        ${roomNumber ? `Room Number: ${roomNumber}` : ''}
        
        Next Steps:
        - Check your allocated hostel details
        - Contact the Hostel Management office for key collection
        - Report at the hostel on your designated arrival date
        
        For any queries, contact: hostel@iitrpr.ac.in
        
        © 2024 IIT Ropar. All rights reserved.
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`[Email] Approval notification sent successfully to ${email}`)
    return true
  } catch (error) {
    console.error(`[Email] Failed to send approval notification to ${email}:`, error)
    return false
  }
}

export async function sendApplicationRejectionEmail(
  email: string,
  applicantName: string,
  applicationId: string,
  rejectionReason: string,
  stakeholder: string
) {
  // Initialize if not already done
  if (!transporter) {
    await initializeEmailTransport()
  }

  if (!transporter) {
    console.warn('[Email] Email sending disabled - SMTP not configured')
    return false
  }

  try {
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
    const trackingUrl = `${process.env.APP_URL || 'http://localhost:3000'}/track`

    const stakeholderLabels: Record<string, string> = {
      FACULTY_SUPERVISOR: 'Faculty Supervisor',
      HOD: 'Head of Department',
      JUNIOR_SUPERINTENDENT: 'Hostel Management',
      ASSISTANT_REGISTRAR: 'Assistant Registrar',
      CHIEF_WARDEN: 'Chief Warden',
    }

    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: 'Application Status Update - IIT Ropar Hostel Allocation',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
              .warning-badge { display: inline-block; background-color: #dc2626; color: white; padding: 10px 15px; border-radius: 5px; font-weight: bold; font-size: 14px; }
              .remarks-box { background-color: #fee2e2; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #dc2626; }
              .remarks-label { color: #991b1b; font-weight: bold; margin-bottom: 8px; }
              .remarks-text { color: #7f1d1d; }
              .app-id-box { background-color: #dbeafe; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #0284c7; }
              .cta-button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
              .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>IIT Ropar</h1>
                <p>Hostel Allocation System</p>
              </div>
              <div class="content">
                <p>Dear ${applicantName},</p>
                
                <p><span class="warning-badge">⚠ APPLICATION REJECTED</span></p>
                
                <p>Your hostel allocation application has been reviewed by the ${stakeholderLabels[stakeholder] || stakeholder} and has not been approved at this stage.</p>
                
                <div class="remarks-box">
                  <div class="remarks-label">Feedback from ${stakeholderLabels[stakeholder] || stakeholder}:</div>
                  <div class="remarks-text">${rejectionReason}</div>
                </div>
                
                <div class="app-id-box">
                  <p style="margin: 0;"><strong>Application ID:</strong> ${applicationId}</p>
                </div>
                
                <h3 style="margin-top: 25px;">What Next?</h3>
                <p>You have the following options:</p>
                <ul>
                  <li>Revise your application and resubmit if allowed</li>
                  <li>Contact the Hostel Management office to discuss the decision</li>
                  <li>Reach out to your Faculty Supervisor for guidance</li>
                </ul>
                
                <p style="margin-top: 25px; background-color: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
                  <strong style="color: #92400e;">Contact Us:</strong> If you would like to discuss this decision or need clarification, please contact the Hostel Management office at hostel@iitrpr.ac.in
                </p>
                
                <a href="${trackingUrl}" class="cta-button">View Application Status</a>
              </div>
              <div class="footer">
                <p>© 2024 IIT Ropar. All rights reserved.</p>
                <p>This is an automated email, please do not reply directly.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        IIT Ropar - Hostel Allocation System
        
        Dear ${applicantName},
        
        APPLICATION REJECTED
        
        Your hostel allocation application has been reviewed and not approved at this stage.
        
        Feedback from ${stakeholderLabels[stakeholder] || stakeholder}:
        ${rejectionReason}
        
        Application ID: ${applicationId}
        
        For more information or to discuss this decision, contact:
        Hostel Management Office: hostel@iitrpr.ac.in
        
        © 2024 IIT Ropar. All rights reserved.
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`[Email] Rejection notification sent successfully to ${email}`)
    return true
  } catch (error) {
    console.error(`[Email] Failed to send rejection notification to ${email}:`, error)
    return false
  }
}
