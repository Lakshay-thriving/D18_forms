import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import { randomBytes } from "crypto"

function generateSlipNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  const random = randomBytes(2).toString("hex").toUpperCase()
  return `SLIP-${dateStr}-${random}`
}

// GET /api/slips - Get slips based on role
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = searchParams.get("limit")

    let whereClause: Record<string, unknown> = {}

    // PA can only see their own slips
    if (user.role === "PA") {
      whereClause.createdById = user.id
    }

    // Filter by status if provided
    if (status && ["PENDING", "PREPARING", "DELIVERED"].includes(status)) {
      whereClause.status = status
    }

    const slips = await prisma.slip.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    })

    return NextResponse.json({ slips })
  } catch (error) {
    console.error("Get slips error:", error)
    return NextResponse.json({ error: "Failed to get slips" }, { status: 500 })
  }
}

// POST /api/slips - Create a new slip (PA only)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "PA" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { guestName, roomNumber, teaCount, coffeeCount, instructions, authorizedBy, signature } = body

    if (!guestName) {
      return NextResponse.json({ error: "Guest name is required" }, { status: 400 })
    }

    if (teaCount === 0 && coffeeCount === 0) {
      return NextResponse.json(
        { error: "At least one tea or coffee must be ordered" },
        { status: 400 }
      )
    }

    const slip = await prisma.slip.create({
      data: {
        slipNumber: generateSlipNumber(),
        guestName,
        roomNumber: roomNumber || null,
        teaCount: teaCount || 0,
        coffeeCount: coffeeCount || 0,
        instructions: instructions || null,
        authorizedBy: authorizedBy || null,
        signature: signature || null,
        createdById: user.id,
      },
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

    return NextResponse.json({ slip }, { status: 201 })
  } catch (error) {
    console.error("Create slip error:", error)
    return NextResponse.json({ error: "Failed to create slip" }, { status: 500 })
  }
}
