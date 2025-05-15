'use client';

import { formatDate } from '@/lib/utils';
import { SerializedBooking } from '@/types/booking';
import { SerializedExpert } from '@/types/expert';
import Image from 'next/image';

interface BookingDetailsProps {
  booking: SerializedBooking;
  expert: SerializedExpert;
}

export default function BookingDetails({ booking, expert }: BookingDetailsProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Booking Details</h2>
      
      <div className="flex items-center mb-6">
        <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
          <Image
            src={expert.image || '/images/placeholder.png'}
            alt={`${expert.firstName} ${expert.lastName}`}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-medium">{`${expert.firstName} ${expert.lastName}`}</h3>
          <p className="text-sm text-gray-500">{expert.categories.join(', ')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Date & Time</p>
          <p className="text-base">{formatDate(booking.startTime)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Duration</p>
          <p className="text-base">{booking.duration} minutes</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="text-base capitalize">{booking.status}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Cost</p>
          <p className="text-base">${booking.totalCost}</p>
        </div>
        {booking.notes && (
          <div>
            <p className="text-sm text-gray-500">Notes</p>
            <p className="text-base">{booking.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
