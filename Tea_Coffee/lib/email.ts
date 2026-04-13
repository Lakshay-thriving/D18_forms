import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOtpEmail(email: string, otp: string) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: "IIT Ropar Tea/Coffee System - Your Login OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">IIT Ropar Tea/Coffee Slip System</h2>
        <p>Your one-time password (OTP) for login is:</p>
        <div style="background-color: #f0f4f8; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otp}</span>
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p style="color: #64748b; font-size: 14px;">If you did not request this OTP, please ignore this email.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}

export async function sendSlipStatusEmail(
  email: string,
  slipNumber: string,
  status: string,
  guestName: string,
  itemsDescription: string
) {
  const statusMessages: Record<string, { subject: string; message: string; color: string }> = {
    PREPARING: {
      subject: `Slip #${slipNumber} - Order Being Prepared`,
      message: "Your order is now being prepared by the vendor.",
      color: "#f59e0b",
    },
    DELIVERED: {
      subject: `Slip #${slipNumber} - Order Delivered`,
      message: "Your order has been delivered successfully.",
      color: "#10b981",
    },
  }

  const statusInfo = statusMessages[status]
  if (!statusInfo) return

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: `IIT Ropar Tea/Coffee - ${statusInfo.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a365d;">IIT Ropar Tea/Coffee Slip System</h2>
        <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Slip Number:</strong> ${slipNumber}</p>
          <p style="margin: 0 0 10px 0;"><strong>Guest Name:</strong> ${guestName}</p>
          <p style="margin: 0 0 10px 0;"><strong>Items:</strong> ${itemsDescription}</p>
          <p style="margin: 0;">
            <strong>Status:</strong> 
            <span style="color: ${statusInfo.color}; font-weight: bold;">${status}</span>
          </p>
        </div>
        <p>${statusInfo.message}</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
