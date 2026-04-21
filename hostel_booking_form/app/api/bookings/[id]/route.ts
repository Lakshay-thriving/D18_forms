import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    const booking = await prisma.booking.update({
      where: { id },
      data: body,
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = (session?.user as any)?.role;
    const userEmail = session?.user?.email;

    if (userEmail) {
      await prisma.systemLog.create({
        data: {
          userEmail: userEmail,
          action: 'BOOKING_UPDATED',
          details: `${userRole} updated booking ${id} status to ${body.status || booking.status}`
        }
      });
    }

    // Attempt to notify applicant about outcome
    if (booking.userId && body.status && body.status !== 'SUBMITTED') {
      let isRejection = body.status.includes('REJECTED');
      let isApproval = body.status === 'COMPLETED' || body.status.includes('APPROVED');
      
      if (isRejection || isApproval) {
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            title: isApproval ? 'Application Update' : 'Application Rejected',
            message: `Your application GR-${booking.id.slice(0, 5).toUpperCase()} is now ${body.status.replace(/_/g, ' ')}.`,
            type: isRejection ? 'error' : 'success',
            link: `/status/${booking.id}`
          }
        });
      }
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Failed to update booking', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const booking = await prisma.booking.findUnique({
      where: { id },
    });
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Failed to fetch booking', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}
