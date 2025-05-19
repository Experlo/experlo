import { NextResponse } from 'next/server';
import { verifyToken, getAuthToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for booking creation
const createBookingSchema = z.object({
  expertId: z.string(),
  scheduledAt: z.string(), // ISO string 
  durationMinutes: z.number().int().min(15).max(180),
});

export async function POST(request: Request) {
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

    // Parse and validate request body
    const body = await request.json();
    console.log('Booking request:', body);
    
    const { expertId, scheduledAt, durationMinutes } = createBookingSchema.parse(body);
    
    // Validate that the expert exists
    const expert = await prisma.expertProfile.findUnique({
      where: { id: expertId },
    });
    
    if (!expert) {
      return NextResponse.json(
        { error: 'Expert not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is trying to book themselves
    if (expert.userId === payload.userId) {
      return NextResponse.json(
        { error: 'You cannot book a session with yourself' },
        { status: 400 }
      );
    }
    
    // Parse the scheduledAt string into a Date
    const scheduledAtDate = new Date(scheduledAt);
    
    // Calculate end time
    const endTime = new Date(scheduledAtDate);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    
    // Check if the time slot is available (not booked by someone else)
    const existingBooking = await prisma.booking.findFirst({
      where: {
        expertId,
        OR: [
          // Check for overlapping bookings
          {
            scheduledAt: {
              lt: endTime,
            },
            // This calculation assumes we store the end time or can calculate it
            // We'll need to add a check to ensure the time doesn't overlap with another booking
            AND: {
              scheduledAt: {
                gte: scheduledAtDate,
              },
            },
          },
          {
            scheduledAt: {
              lte: scheduledAtDate,
            },
            AND: {
              // For bookings that start before but end after our desired start time
              // This is a simplification; in a real system, you'd compare against the actual end time
              scheduledAt: {
                gte: new Date(scheduledAtDate.getTime() - durationMinutes * 60000),
              },
            },
          },
        ],
      },
    });
    
    if (existingBooking) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 400 }
      );
    }
    
    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: payload.userId,
        expertId,
        scheduledAt: scheduledAtDate,
        durationMinutes,
        status: 'SCHEDULED', // Default status
      },
      include: {
        user: true,
        expert: {
          include: {
            user: true,
          },
        },
      },
    });
    
    // Return the created booking
    return NextResponse.json({
      id: booking.id,
      userId: booking.userId,
      expertId: booking.expertId,
      expertName: `${booking.expert.user.firstName} ${booking.expert.user.lastName}`,
      scheduledAt: booking.scheduledAt,
      durationMinutes: booking.durationMinutes,
      status: booking.status,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve user's bookings
export async function GET() {
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

    // Get all bookings for the authenticated user, both as a user and as an expert
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        bookings: {
          include: {
            expert: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            scheduledAt: 'desc',
          },
        },
        expertProfile: {
          include: {
            bookings: {
              include: {
                user: true,
              },
              orderBy: {
                scheduledAt: 'desc',
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Format the bookings data
    const userBookings = user.bookings.map((booking) => ({
      id: booking.id,
      expertId: booking.expertId,
      expertName: `${booking.expert.user.firstName} ${booking.expert.user.lastName}`,
      scheduledAt: booking.scheduledAt,
      durationMinutes: booking.durationMinutes,
      status: booking.status,
      role: 'client',
    }));

    const expertBookings = user.expertProfile?.bookings.map((booking) => ({
      id: booking.id,
      userId: booking.userId,
      clientName: `${booking.user.firstName} ${booking.user.lastName}`,
      scheduledAt: booking.scheduledAt,
      durationMinutes: booking.durationMinutes,
      status: booking.status,
      role: 'expert',
    })) || [];

    return NextResponse.json({
      userBookings,
      expertBookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
