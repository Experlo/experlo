import { NextResponse } from 'next/server';
import { verifyToken, getAuthToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

// This API endpoint automatically updates booking status when calls are completed
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

    const now = new Date();

    // Find all SCHEDULED bookings that have now passed their end time
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lt: new Date(now.getTime() - 180 * 60000), // More than 3 hours old (to account for any duration)
        },
      },
    });
    
    // Update booking statuses to COMPLETED
    const updateResults = await Promise.all(
      expiredBookings.map(async (booking) => {
        // Calculate if the booking is completed based on its duration
        const endTime = new Date(booking.scheduledAt);
        endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
        
        if (now > endTime) {
          // Update the booking status to COMPLETED
          return prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'COMPLETED' },
          });
        }
        return null;
      })
    );
    
    // Filter out null results and count updated bookings
    const updatedBookings = updateResults.filter(Boolean);
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedBookings.length} completed bookings`,
      updatedBookingIds: updatedBookings.map(b => b?.id)
    });
  } catch (error) {
    console.error('Error updating booking statuses:', error);
    return NextResponse.json(
      { error: 'Failed to update booking statuses' },
      { status: 500 }
    );
  }
}
