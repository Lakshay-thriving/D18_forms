import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import type { UserRole, Course } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { entryNumber: validatedData.entryNumber },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or entry number already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(validatedData.password)

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: 'STUDENT',
        entryNumber: validatedData.entryNumber,
        course: validatedData.course as Course,
        hostelName: validatedData.hostelName,
        roomNumber: validatedData.roomNumber,
        messName: validatedData.messName,
      },
    })

    const token = await createToken(user.id, user.role as UserRole)
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 400 }
    )
  }
}
