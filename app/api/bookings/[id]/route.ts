import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();

    const booking = await prisma.booking.update({
      where: { id },
      data: body,
    });
    
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
