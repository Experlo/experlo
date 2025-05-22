import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { CallStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const { bookingId, event, deviceInfo, setting } = await request.json();
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Find active call
    const activeCalls = await prisma.call.findMany({
      where: {
        bookingId,
        status: { in: [CallStatus.SCHEDULED, CallStatus.IN_PROGRESS] }
      },
      orderBy: {
        startedAt: 'desc'
      },
      take: 1
    });
    
    // Get the active call (or create one if not found)
    let call = activeCalls[0];
    
    if (!call) {
      // This shouldn't happen normally as the token endpoint creates the call
      // But just in case, create a new call
      call = await prisma.call.create({
        data: {
          bookingId,
          channelName: `experlo-call-${bookingId}`,
          status: 'IN_PROGRESS' as any
        }
      });
    }

    // Handle different event types
    switch (event) {
      case 'join':
        // Track user joining the call
        const existingParticipant = await prisma.callParticipant.findUnique({
          where: {
            callId_userId: {
              callId: call.id,
              userId
            }
          }
        });

        if (existingParticipant) {
          // Update existing participant
          await prisma.callParticipant.update({
            where: {
              id: existingParticipant.id
            },
            data: {
              joinedAt: new Date(),
              leftAt: null, // Clear previous left time if rejoining
              // Update network quality info
              ...(deviceInfo ? { networkQuality: deviceInfo.networkQuality || 5 } : {})
            }
          });
        } else {
          // Create new participant
          const isExpert = booking.expertId === userId;
          await prisma.callParticipant.create({
            data: {
              callId: call.id,
              userId,
              role: isExpert ? 'EXPERT' : 'CLIENT' as any,
              // Store device info as metadata to avoid schema issues
              ...(deviceInfo ? { 
                audioEnabled: true,
              videoEnabled: true,
              networkQuality: deviceInfo?.networkQuality || 5
              } : {})
            }
          });
        }

        // Update booking status to IN_PROGRESS if currently SCHEDULED
        if (booking.status === 'SCHEDULED') {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'IN_PROGRESS' }
          });
        }
        break;

      case 'leave':
        // Track user leaving the call
        // Find the participant record first
        const participant = await prisma.callParticipant.findFirst({
          where: {
            callId: call.id,
            userId,
            leftAt: null
          }
        });
        
        if (participant) {
          await prisma.callParticipant.update({
            where: {
              id: participant.id
            },
            data: {
              leftAt: new Date(),
              // Calculate duration in seconds
              duration: Math.floor(
                participant.joinedAt 
                  ? (new Date().getTime() - new Date(participant.joinedAt).getTime()) / 1000
                  : 0
              )
            }
          });
        }

        // Check if all participants have left
        const activeParticipants = await prisma.callParticipant.count({
          where: {
            callId: call.id,
            leftAt: null
          }
        });

        if (activeParticipants === 0) {
          // All participants have left, mark call as completed
          const callEnd = new Date();
          
          await prisma.call.update({
            where: { id: call.id },
            data: {
              status: 'COMPLETED' as any,
              endedAt: callEnd,
              duration: Math.floor((callEnd.getTime() - (call.startedAt ? call.startedAt.getTime() : callEnd.getTime())) / 1000)
            }
          });

          // Check if booking status should be updated
          const now = new Date();
          const scheduledAt = new Date(booking.scheduledAt);
          const bookingEndTime = new Date(scheduledAt.getTime() + booking.durationMinutes * 60 * 1000);
          
          if (now >= bookingEndTime) {
            await prisma.booking.update({
              where: { id: bookingId },
              data: { status: 'COMPLETED' as any }
            });
          }
        }
        break;

      case 'setting':
        // Track setting changes (video, audio, screen sharing)
        if (!setting || !setting.type) {
          return NextResponse.json(
            { error: 'Setting details required' },
            { status: 400 }
          );
        }

        // Update participant settings
        await prisma.callParticipant.updateMany({
          where: {
            callId: call.id,
            userId,
            leftAt: null // Only update active participants
          },
          data: {
            ...(setting.type === 'video' && { videoEnabled: setting.enabled }),
            ...(setting.type === 'audio' && { audioEnabled: setting.enabled }),
            ...(setting.type === 'screenShare' && { screenSharing: setting.enabled })
          }
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking call event:', error);
    return NextResponse.json(
      { error: 'Failed to track call event' },
      { status: 500 }
    );
  }
}
