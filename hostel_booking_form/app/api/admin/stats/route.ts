import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const totalUsers = await prisma.user.count();
    const pendingUsers = await prisma.user.count({ where: { status: 'PENDING' } });
    const totalBookings = await prisma.booking.count();
    const activeAnnouncements = await prisma.announcement.count({ where: { active: true } });

    return NextResponse.json({
      totalUsers,
      pendingUsers,
      totalBookings,
      activeAnnouncements
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
