'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/Button';
import { toast } from 'sonner';
import { BookingStatus } from '@/core/types/booking';

interface Booking {
  _id: string;
  userId: string;
  expertId: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: BookingStatus;
  totalCost: number;
  notes?: string;
  meetingUrl?: string;
  expert?: {
    _id: string;
    name: string;
    image?: string;
    expertise: string[];
  };
}

interface UpcomingBookingsProps {
  userId: string;
}

export default function UpcomingBookings({ userId }: UpcomingBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/bookings/upcoming?limit=3`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(data.bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to fetch your bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No upcoming bookings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {bookings.map((booking) => {
        const startTime = new Date(booking.startTime);
        const isUpcoming = startTime > new Date();

        if (!isUpcoming) return null;

        return (
          <div
            key={booking._id}
            className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              {booking.expert?.image && (
                <div className="relative h-12 w-12">
                  <Image
                    src={booking.expert.image}
                    alt={booking.expert.name}
                    className="rounded-full"
                    fill
                    sizes="48px"
                  />
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-900">
                  Call with {booking.expert?.name || 'Expert'}
                </h3>
                <p className="text-sm text-gray-500">
                  {format(startTime, 'MMM d, yyyy h:mm a')} ({booking.duration} min)
                </p>
                <div className="mt-1">
                  {booking.expert?.expertise?.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="inline-block px-2 py-0.5 mr-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={booking.meetingUrl || `/call/${booking.expertId}`}>
                <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Join Call
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}