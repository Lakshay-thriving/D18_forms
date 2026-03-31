import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendOtpEmail(email: string, otp: string, name: string) {
  const mailOptions = {
    from: `"IIT Ropar Hostel" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your OTP for IIT Ropar Hostel Accommodation System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">IIT Ropar Hostel Accommodation System</h2>
        <p>Dear ${name},</p>
        <p>Your One-Time Password (OTP) for login is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e3a5f;">${otp}</span>
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you did not request this OTP, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Indian Institute of Technology Ropar</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendApplicationStatusEmail(
  email: string,
  name: string,
  status: 'approved' | 'rejected',
  remarks?: string,
  hostelDetails?: { hostel: string; room?: string }
) {
  const isApproved = status === 'approved'
  
  const mailOptions = {
    from: `"IIT Ropar Hostel" <${process.env.SMTP_USER}>`,
    to: email,
    subject: isApproved 
      ? 'Congratulations! Your Hostel Accommodation Request is Approved'
      : 'Update on Your Hostel Accommodation Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">IIT Ropar Hostel Accommodation System</h2>
        <p>Dear ${name},</p>
        ${isApproved ? `
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin: 0;">Your hostel accommodation request has been approved!</h3>
          </div>
          ${hostelDetails ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Hostel Allocated:</strong> ${hostelDetails.hostel}</p>
              ${hostelDetails.room ? `<p style="margin: 5px 0;"><strong>Room Number:</strong> ${hostelDetails.room}</p>` : ''}
            </div>
          ` : ''}
          <p>Please report to the hostel office with your ID proof and payment receipt.</p>
        ` : `
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #721c24; margin: 0;">We regret to inform you that your hostel accommodation request has been rejected.</h3>
          </div>
          ${remarks ? `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Remarks:</strong> ${remarks}</p>
            </div>
          ` : ''}
          <p>If you have any questions, please contact the hostel management office.</p>
        `}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Indian Institute of Technology Ropar</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendRejectionEmail(
  email: string,
  name: string,
  rejectedBy: string,
  remarks?: string
) {
  const mailOptions = {
    from: `"IIT Ropar Hostel" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Update on Your Hostel Accommodation Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">IIT Ropar Hostel Accommodation System</h2>
        <p>Dear ${name},</p>
        <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #721c24; margin: 0;">Your hostel accommodation request has been rejected by ${rejectedBy}.</h3>
        </div>
        ${remarks ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Remarks:</strong> ${remarks}</p>
          </div>
        ` : ''}
        <p>You may submit a new application after addressing the concerns mentioned above.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Indian Institute of Technology Ropar</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
