'use client';

import Link from 'next/link';
import BookingsClient from '@/app/bookings/BookingsClient';

interface UpcomingBookingsSectionProps {
  userId: string;
}

export default function UpcomingBookingsSection({ userId }: UpcomingBookingsSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Upcoming Bookings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Join your scheduled video calls with experts
          </p>
        </div>
        <Link
          href="/bookings"
          className="text-base font-semibold text-indigo-600 hover:text-indigo-500"
        >
          View all →
        </Link>
      </div>
      <div className="mt-6">
        <BookingsClient userId={userId} />
      </div>
    </div>
  );
}
