import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const email = searchParams.get('email');
  
  try {
    let whereClause: any = {};
    if (status) whereClause.status = status;
    if (email) whereClause.email = email;

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Failed to fetch bookings', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const arrivalDate = new Date(body.arrivalDate);
    const today = new Date();
    const diffTime = Math.abs(arrivalDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays < 4) {
      return NextResponse.json({ error: 'Arrival date must be at least 4 days in advance.' }, { status: 400 });
    }

    const totalGuests = Number(body.totalMale) + Number(body.totalFemale);
    if (totalGuests > 2) {
       return NextResponse.json({ error: 'Maximum 2 persons allowed per room.' }, { status: 400 });
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session?.user as any;
    const userId = user?.userId;

    const newBooking = await prisma.booking.create({
      data: {
        userId: userId || null,
        applicantName: body.applicantName,
        designation: body.designation,
        department: body.department,
        empCode: body.empCode,
        mobile: body.mobile,
        email: body.email,
        totalMale: Number(body.totalMale),
        totalFemale: Number(body.totalFemale),
        guestNames: body.guestNames,
        relation: body.relation,
        guestAddress: body.guestAddress,
        guestContact: body.guestContact,
        guestEmail: body.guestEmail,
        purpose: body.purpose,
        roomType: body.roomType,
        arrivalDate: new Date(body.arrivalDate),
        departureDate: new Date(body.departureDate),
        paidBy: body.paidBy,
        undertakingAccepted: body.undertakingAccepted,
        applicantSignature: body.applicantSignature,
        applicantRemarks: body.applicantRemarks,
        status: 'SUBMITTED'
      }
    });

    if (user) {
      await prisma.systemLog.create({
        data: {
          userEmail: user.email,
          userId: userId || undefined,
          action: 'BOOKING_SUBMITTED',
          details: `Submitted booking for ${body.guestNames} (${body.roomType})`
        }
      });
      
      if (userId) {
        await prisma.notification.create({
          data: {
            userId: userId,
            title: 'Application Submitted',
            message: `Your guest house request for ${body.guestNames} was successfully submitted and is pending review.`,
            type: 'info'
          }
        });
      }
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Failed to create booking', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
