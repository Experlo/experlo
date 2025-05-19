import { NextResponse } from 'next/server';
import { verifyToken, getAuthToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { expertId: string } }
) {
  try {
    // Verify authentication
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const expertId = params.expertId;
    
    // Check if the expert exists
    const expert = await prisma.expertProfile.findUnique({
      where: { id: expertId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    });
    
    if (!expert) {
      return NextResponse.json(
        { error: 'Expert not found' },
        { status: 404 }
      );
    }
    
    // Fetch all bookings between the authenticated user and this expert
    const bookings = await prisma.booking.findMany({
      where: {
        userId: payload.userId,
        expertId: expertId,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
    
    // Format the bookings data
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      expertId: booking.expertId,
      expertName: `${expert.user.firstName} ${expert.user.lastName}`, 
      scheduledAt: booking.scheduledAt,
      durationMinutes: booking.durationMinutes,
      status: booking.status,
      role: 'client',
    }));
    
    return NextResponse.json({
      bookings: formattedBookings,
      expert: {
        id: expert.id,
        name: `${expert.user.firstName} ${expert.user.lastName}`,
        image: expert.user.image,
      },
    });
  } catch (error) {
    console.error('Error fetching expert bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
