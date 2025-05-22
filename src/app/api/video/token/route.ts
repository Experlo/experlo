import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { CallStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // Get authenticated user
    console.log('[DEBUG] Token API: Starting token generation process');
    const authResult = await auth();
    const userId = authResult.userId;
    
    console.log('[DEBUG] Token API: User authentication result:', { userId: userId?.substring(0, 6) + '...' });
    
    if (!userId) {
      console.log('[DEBUG] Token API: Unauthorized request - no user ID');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const requestData = await request.json();
    const { bookingId } = requestData;
    console.log('[DEBUG] Token API: Request data:', { bookingId, otherFields: Object.keys(requestData).filter(k => k !== 'bookingId') });
    
    if (!bookingId) {
      console.log('[DEBUG] Token API: Missing booking ID');
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Get booking
    console.log('[DEBUG] Token API: Fetching booking:', bookingId);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        expert: {
          include: {
            user: true
          }
        }
      }
    });

    if (!booking) {
      console.log('[DEBUG] Token API: Booking not found:', bookingId);
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    console.log('[DEBUG] Token API: Booking found:', { 
      id: booking.id,
      status: booking.status,
      scheduledAt: booking.scheduledAt,
      durationMinutes: booking.durationMinutes,
      clientId: booking.userId, 
      expertId: booking.expert?.userId
    });

    // Check if user is authorized (either client or expert)
    const isClient = booking.userId === userId;
    const isExpert = booking.expert.userId === userId;
    
    console.log('[DEBUG] Token API: Authorization check:', { 
      isClient, 
      isExpert, 
      currentUserId: userId?.substring(0, 6) + '...',
      bookingUserId: booking.userId?.substring(0, 6) + '...',
      expertUserId: booking.expert?.userId?.substring(0, 6) + '...'
    });

    if (!isClient && !isExpert) {
      console.log('[DEBUG] Token API: User not authorized for this booking');
      return NextResponse.json(
        { error: 'You are not authorized to join this call' },
        { status: 403 }
      );
    }

    // Check if booking is within the valid time range
    const now = new Date();
    const bookingStartTime = new Date(booking.scheduledAt);
    const bookingEndTime = new Date(bookingStartTime.getTime() + booking.durationMinutes * 60 * 1000);
    
    // Allow joining 5 minutes before scheduled time
    const earlyJoinTime = new Date(bookingStartTime.getTime() - 5 * 60 * 1000);

    console.log('[DEBUG] Token API: Time check:', { 
      now: now.toISOString(),
      bookingStartTime: bookingStartTime.toISOString(),
      bookingEndTime: bookingEndTime.toISOString(),
      earlyJoinTime: earlyJoinTime.toISOString(),
      isEarly: now < earlyJoinTime,
      isEnded: now > bookingEndTime
    });

    // TEMPORARY: Skip time validation for debugging
    // if (now < earlyJoinTime) {
    //   const minutesToStart = Math.ceil((earlyJoinTime.getTime() - now.getTime()) / (60 * 1000));
    //   console.log(`[DEBUG] Token API: Call not available yet - ${minutesToStart} minutes until early join time`);
    //   return NextResponse.json(
    //     { error: `Call not available yet. You can join ${minutesToStart} minutes before the scheduled time.` },
    //     { status: 400 }
    //   );
    // }

    // if (now > bookingEndTime) {
    //   console.log('[DEBUG] Token API: Call has ended');
    //   return NextResponse.json(
    //     { error: 'Call has ended' },
    //     { status: 400 }
    //   );
    // }

    // Generate a channel name
    const channelName = `experlo-call-${bookingId}`;

    // Generate a token
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    
    console.log('[DEBUG] Token API: Agora credentials check:', {
      appIdExists: !!appId,
      appCertificateExists: !!appCertificate
    });
    
    if (!appId || !appCertificate) {
      console.error('[DEBUG] Token API: Agora credentials missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Set token expiration (in seconds)
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // User ID as number for Agora (for simplicity, use timestamp)
    const uidNumber = Date.now() % 100000;

    // Generate the token
    console.log('[DEBUG] Token API: Building token with:', {
      channelName,
      uid: uidNumber,
      role: 'PUBLISHER',
      expiresIn: expirationTimeInSeconds
    });
    
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uidNumber,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );
    
    console.log('[DEBUG] Token API: Token generated successfully');

    // Create or update call record
    let call = await prisma.call.findFirst({
      where: {
        bookingId,
        status: { in: [CallStatus.SCHEDULED, CallStatus.IN_PROGRESS] }
      }
    });

    if (!call) {
      // Create new call
      call = await prisma.call.create({
        data: {
          bookingId,
          channelName,
          status: CallStatus.IN_PROGRESS
        }
      });
    }

    // Create call participant if not exists
    const participant = await prisma.callParticipant.upsert({
      where: {
        callId_userId: {
          callId: call.id,
          userId
        }
      },
      update: {}, // No update if exists
      create: {
        callId: call.id,
        userId,
        role: isExpert ? 'EXPERT' : 'CLIENT'
      }
    });

    // Update booking status if needed
    if (booking.status === CallStatus.SCHEDULED) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: CallStatus.IN_PROGRESS }
      });
    }

    const response = {
      token,
      channelName,
      uid: uidNumber,
      callId: call.id,
      participantId: participant.id
    };
    
    console.log('[DEBUG] Token API: Returning successful response');
    return NextResponse.json(response);
  } catch (error) {
    console.error('[DEBUG] Token API: Error generating token:', error);
    return NextResponse.json(
      { error: `Failed to generate token: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
