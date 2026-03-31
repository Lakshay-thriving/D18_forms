import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createOtp } from "@/lib/otp"
import { sendOtpEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists (admin-only registration means user must exist)
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email. Please contact an administrator." },
        { status: 404 }
      )
    }

    // Generate and send OTP
    const otp = await createOtp(email)
    await sendOtpEmail(email, otp)

    return NextResponse.json({ message: "OTP sent successfully" })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
