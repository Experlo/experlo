'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/Button';
import { SerializedBooking } from '@/core/types/booking';

interface BookingActionsProps {
  booking: SerializedBooking;
}

export default function BookingActions({ booking }: BookingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookings/${booking._id}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating booking:', error);
      // Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => handleAction('cancel');
  const handleStart = () => handleAction('start');
  const handleComplete = () => handleAction('complete');

  // Calculate if the booking can be started (15 minutes before start time)
  const now = new Date();
  const startTime = new Date(booking.startTime);
  const canStart = startTime.getTime() - now.getTime() <= 15 * 60 * 1000;

  return (
    <div className="flex gap-4">
      {/* Show Join button when status is scheduled and within 15 minutes of start time */}
      {booking.status === 'scheduled' && canStart && (
        <Button
          onClick={handleStart}
          disabled={isLoading}
          variant="default"
          className="w-full"
        >
          Join Meeting
        </Button>
      )}

      {/* Show Complete button when status is in-progress */}
      {booking.status === 'in-progress' && (
        <Button
          onClick={handleComplete}
          disabled={isLoading}
          variant="default"
          className="w-full"
        >
          Complete Meeting
        </Button>
      )}

      {/* Show Cancel button when status is scheduled */}
      {booking.status === 'scheduled' && (
        <Button
          onClick={handleCancel}
          disabled={isLoading}
          variant="destructive"
          className="w-full"
        >
          Cancel Booking
        </Button>
      )}
    </div>
  );
}
