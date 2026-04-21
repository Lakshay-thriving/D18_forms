import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, empCode, mobile } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Domain validation
    if (!email.endsWith('@iitrpr.ac.in')) {
      return NextResponse.json({ error: 'Only IIT Ropar email addresses are allowed.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with PENDING status
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        empCode: empCode || null,
        mobile: mobile || null,
        role: 'STUDENT',
        status: 'PENDING'
      }
    });

    // Log the event
    await prisma.systemLog.create({
      data: {
        userEmail: email,
        userId: newUser.id,
        action: 'USER_SIGNUP',
        details: `Student registration submitted: ${name} (${email})`
      }
    });

    return NextResponse.json({ 
      message: 'Registration successful! Your account is pending admin approval.',
      user: { id: newUser.id, email: newUser.email }
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error during registration.' }, { status: 500 });
  }
}
