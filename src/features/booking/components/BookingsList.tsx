'use client';

import { useState, useEffect } from 'react';
import BookingCard from './BookingCard';

interface Booking {
  id: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  status: string;
  role: 'client' | 'expert';
  expertId?: string;
  expertName?: string;
  userId?: string;
  clientName?: string;
  expert?: {
    id: string;
    name: string;
    title?: string;
    photo?: string;
  };
  client?: {
    id: string;
    name: string;
    title?: string;
    photo?: string;
  };
}

interface BookingsListProps {
  bookings: Booking[];
  emptyMessage: string;
  onRefresh?: () => void;
}

// Add type definition for global window property
declare global {
  interface Window {
    lastStatusUpdate?: number;
  }
}

// Helper function to check if a call is currently active based on scheduled time and duration
function isCallActive(booking: Booking): boolean {
  const now = new Date();
  const scheduledAt = new Date(booking.scheduledAt);
  const endTime = new Date(scheduledAt);
  endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
  
  // The call is active if current time is between start time and end time
  return now >= scheduledAt && now <= endTime;
}

export default function BookingsList({ bookings, emptyMessage, onRefresh }: BookingsListProps) {
  const [sortedBookings, setSortedBookings] = useState<Booking[]>([]);
  const [filterState, setFilterState] = useState<string>('upcoming');
  
  useEffect(() => {
    console.log('BookingsList received bookings:', bookings);
    
    // Format booking dates to Date objects
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      scheduledAt: new Date(booking.scheduledAt),
    }));
    
    // Sort bookings by date and status
    const now = new Date();
    
    const upcomingBookings = formattedBookings
      .filter(booking => 
        // Include future bookings and active calls (IN_PROGRESS status)
        new Date(booking.scheduledAt) > now || 
        booking.status.toUpperCase() === 'IN_PROGRESS' ||
        booking.status.toUpperCase() === 'SCHEDULED' && isCallActive(booking)
      )
      .sort((a, b) => {
        // Active calls should appear first
        if (a.status.toUpperCase() === 'IN_PROGRESS' && b.status.toUpperCase() !== 'IN_PROGRESS') {
          return -1;
        }
        if (a.status.toUpperCase() !== 'IN_PROGRESS' && b.status.toUpperCase() === 'IN_PROGRESS') {
          return 1;
        }
        // Then sort by scheduled time
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      });
      
    const pastBookings = formattedBookings
      .filter(booking => 
        // Past calls are those in the past that are not active
        new Date(booking.scheduledAt) <= now && 
        booking.status.toUpperCase() !== 'IN_PROGRESS' &&
        !(booking.status.toUpperCase() === 'SCHEDULED' && isCallActive(booking))
      )
      .sort((a, b) => {
        return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(); // reversed for past
      });
      
    // Set the sorted bookings based on filter state
    if (filterState === 'upcoming') {
      setSortedBookings(upcomingBookings);
    } else if (filterState === 'past') {
      setSortedBookings(pastBookings);
    } else {
      setSortedBookings([...upcomingBookings, ...pastBookings]);
    }
  }, [bookings, filterState]);

  const handleFilterChange = (newFilter: string) => {
    setFilterState(newFilter);
  };
  
  // If there are no bookings to display
  if (sortedBookings.length === 0) {
    return (
      <div className="p-6 my-4 bg-white rounded-lg shadow-sm text-center">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${filterState === 'upcoming' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleFilterChange('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${filterState === 'past' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleFilterChange('past')}
        >
          Past
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${filterState === 'all' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleFilterChange('all')}
        >
          All
        </button>
      </div>
      
      {/* Bookings list */}
      <div className="space-y-4">
        {sortedBookings.map(booking => (
          <BookingCard key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}
