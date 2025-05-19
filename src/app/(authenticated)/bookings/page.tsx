'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { CalendarIcon } from '@heroicons/react/24/outline';
import BookingsList from '@/features/booking/components/BookingsList';

interface Booking {
  id: string;
  expertId?: string;
  userId?: string;
  expertName?: string;
  clientName?: string;
  scheduledAt: string | Date;
  durationMinutes: number;
  status: string;
  role: 'client' | 'expert';
}

export default function BookingsPage() {
  const { user } = useUser();
  const [clientBookings, setClientBookings] = useState<Booking[]>([]);
  const [expertBookings, setExpertBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch and update bookings
  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      console.log('Bookings data:', data);
      
      // Process user bookings (as client)
      const userBookings = data.userBookings.map((booking: Booking) => ({
        ...booking,
        scheduledAt: new Date(booking.scheduledAt),
        role: 'client'
      }));
      
      // Process expert bookings
      const expertBookings = data.expertBookings.map((booking: Booking) => ({
        ...booking,
        scheduledAt: new Date(booking.scheduledAt),
        role: 'expert'
      }));
      
      // Sort all bookings by date - upcoming first, then past
      const sortByDate = (a: Booking, b: Booking) => {
        return (a.scheduledAt as Date).getTime() - (b.scheduledAt as Date).getTime();
      };
      
      const sortedUserBookings = [...userBookings].sort(sortByDate);
      const sortedExpertBookings = [...expertBookings].sort(sortByDate);
      
      setClientBookings(sortedUserBookings);
      setExpertBookings(sortedExpertBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Call fetchBookings when component mounts
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-lg bg-white shadow p-6 text-center">
          <p>Please log in to view your bookings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <CalendarIcon className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Client Bookings - Sessions I've Booked */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sessions I've Booked</h2>
            <BookingsList 
              bookings={clientBookings} 
              emptyMessage="You haven't booked any sessions yet." 
              onRefresh={() => fetchBookings()}
            />
          </div>

          {/* Expert Bookings - Only show if user is an expert */}
          {user.isExpert && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sessions Booked With Me</h2>
              <BookingsList 
                bookings={expertBookings} 
                emptyMessage="No one has booked a session with you yet." 
                onRefresh={() => fetchBookings()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
