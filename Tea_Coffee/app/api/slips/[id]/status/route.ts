import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { sendSlipStatusEmail } from "@/lib/email"

// PATCH /api/slips/[id]/status - Update slip status (Vendor only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "VENDOR" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !["PENDING", "PREPARING", "DELIVERED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get current slip
    const existingSlip = await prisma.slip.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!existingSlip) {
      return NextResponse.json({ error: "Slip not found" }, { status: 404 })
    }

    // Update slip status
    const slip = await prisma.slip.update({
      where: { id },
      data: { status },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Send email notification to PA
    if (existingSlip.createdBy?.email && (status === "PREPARING" || status === "DELIVERED")) {
      const itemsDescription = []
      if (slip.teaCount > 0) itemsDescription.push(`${slip.teaCount} Tea`)
      if (slip.coffeeCount > 0) itemsDescription.push(`${slip.coffeeCount} Coffee`)

      try {
        await sendSlipStatusEmail(
          existingSlip.createdBy.email,
          slip.slipNumber,
          status,
          slip.guestName,
          itemsDescription.join(", ")
        )
      } catch (emailError) {
        console.error("Failed to send status email:", emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ slip })
  } catch (error) {
    console.error("Update slip status error:", error)
    return NextResponse.json({ error: "Failed to update slip status" }, { status: 500 })
  }
}
