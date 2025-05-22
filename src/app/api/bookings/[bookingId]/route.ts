import { NextResponse } from 'next/server';
import { verifyToken, getAuthToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    // Get and validate the booking ID from params
    const { bookingId } = await Promise.resolve(params);
    console.log('[DEBUG] Booking API: Requested booking ID:', bookingId);
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

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
    
    // Fetch the booking with related user and expert details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        expert: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
      },
    });
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is authorized to access this booking
    // They must be either the client or the expert for this booking
    if (payload.userId !== booking.userId && payload.userId !== booking.expert.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to access this booking' },
        { status: 403 }
      );
    }

    // Check if the call time has arrived
    const now = new Date();
    const scheduledTime = booking.scheduledAt;
    
    // Calculate the end time
    const endTime = new Date(scheduledTime);
    endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
    
    // Only allow joining if the current time is within the call window
    // We'll add a 5-minute buffer before the call for users to prepare
    const startTimeWithBuffer = new Date(scheduledTime);
    startTimeWithBuffer.setMinutes(startTimeWithBuffer.getMinutes() - 5);
    
    if (now < startTimeWithBuffer) {
      return NextResponse.json(
        { 
          error: 'This call has not started yet', 
          scheduledAt: scheduledTime,
          minutesUntilStart: Math.ceil((scheduledTime.getTime() - now.getTime()) / 60000)
        },
        { status: 400 }
      );
    }
    
    if (now > endTime) {
      return NextResponse.json(
        { error: 'This call has already ended' },
        { status: 400 }
      );
    }
    
    // Check if the booking status is SCHEDULED
    if (booking.status !== 'SCHEDULED') {
      return NextResponse.json(
        { error: `This call is ${booking.status.toLowerCase()}` },
        { status: 400 }
      );
    }
    
    // Return formatted booking details for the call interface
    return NextResponse.json({
      id: booking.id,
      userId: booking.userId,
      expertId: booking.expertId,
      clientName: `${booking.user.firstName} ${booking.user.lastName}`,
      expertName: `${booking.expert.user.firstName} ${booking.expert.user.lastName}`,
      clientImage: booking.user.image,
      expertImage: booking.expert.user.image,
      scheduledAt: booking.scheduledAt,
      durationMinutes: booking.durationMinutes,
      status: booking.status,
      minutesRemaining: Math.ceil((endTime.getTime() - now.getTime()) / 60000)
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}
