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
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        empCode: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, action, data } = await request.json();

    let updatedUser;

    if (action === 'UPDATE_ROLE') {
      updatedUser = await prisma.user.update({
        where: { id },
        data: { role: data }
      });
      
      await prisma.systemLog.create({
        data: {
          userEmail: session?.user?.email as string || 'Admin',
          action: 'ROLE_UPDATE',
          details: `Changed role for ${updatedUser.email} to ${data}`,
        }
      });
    } 
    else if (action === 'UPDATE_STATUS') {
      updatedUser = await prisma.user.update({
        where: { id },
        data: { status: data }
      });
      
      await prisma.systemLog.create({
        data: {
          userEmail: session?.user?.email as string || 'Admin',
          action: 'STATUS_UPDATE',
          details: `Changed status for ${updatedUser.email} to ${data}`,
        }
      });

      // Send notification to user
      await prisma.notification.create({
        data: {
          userId: id,
          title: 'Account Status Updated',
          message: `Your account status was updated to ${data.toLowerCase()}.`,
          type: data === 'APPROVED' ? 'success' : 'error',
        }
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
