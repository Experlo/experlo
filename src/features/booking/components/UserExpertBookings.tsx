'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { CalendarIcon, ChevronRightIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Booking {
  id: string;
  expertId: string;
  expertName: string;
  scheduledAt: string | Date;
  durationMinutes: number;
  status: string;
  role: 'client';
}

interface UserExpertBookingsProps {
  expertId: string;
}

export default function UserExpertBookings({ expertId }: UserExpertBookingsProps) {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [expertName, setExpertName] = useState<string>('');
  const [activeBookings, setActiveBookings] = useState<{[key: string]: boolean}>({});

  // Check for active bookings that should show the Join Call button
  useEffect(() => {
    const checkActiveBookings = () => {
      const now = new Date();
      const newActiveBookings: {[key: string]: boolean} = {};
      
      bookings.forEach(booking => {
        // Skip if not scheduled
        if (booking.status.toUpperCase() !== 'SCHEDULED') return;
        
        const startTime = booking.scheduledAt instanceof Date 
          ? booking.scheduledAt 
          : new Date(booking.scheduledAt);
          
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
        
        // Check if current time is between start and end time
        if (now >= startTime && now <= endTime) {
          newActiveBookings[booking.id] = true;
        }
      });
      
      setActiveBookings(newActiveBookings);
    };
    
    // Check immediately and then every 15 seconds
    checkActiveBookings();
    const interval = setInterval(checkActiveBookings, 15000);
    
    return () => clearInterval(interval);
  }, [bookings]);
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/bookings/expert/${expertId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        
        // Sort bookings - future bookings first, then past bookings
        const now = new Date();
        const bookingsWithDates = data.bookings.map((booking: Booking) => ({
          ...booking,
          scheduledAt: new Date(booking.scheduledAt)
        }));
        
        // Only show upcoming and active bookings for the expert profile
        const upcomingBookings = bookingsWithDates
          .filter((booking: Booking) => {
            // Only include upcoming and active bookings
            const startTime = booking.scheduledAt as Date;
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
            
            // Keep if it's in the future OR if it's currently active
            return (startTime > now || (now >= startTime && now <= endTime)) && 
                   booking.status.toUpperCase() !== 'CANCELLED' &&
                   booking.status.toUpperCase() !== 'COMPLETED';
          })
          .sort((a: Booking, b: Booking) => 
            (a.scheduledAt as Date).getTime() - (b.scheduledAt as Date).getTime()
          );
          
        // Get the expert's name if available
        if (upcomingBookings.length > 0 && upcomingBookings[0].expertName) {
          setExpertName(upcomingBookings[0].expertName);
        }
        
        setBookings(upcomingBookings);
      } catch (err) {
        console.error('Error fetching expert bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, expertId]);

  if (loading) {
    return (
      <div className="animate-pulse py-4">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-20 bg-gray-200 rounded mb-3"></div>
        <div className="h-20 bg-gray-200 rounded mb-3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 py-2">
        Error loading your bookings
      </div>
    );
  }

  if (bookings.length === 0) {
    return null; // Don't show anything if there are no bookings
  }

  // Helper function to format dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to format times
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get status style - now all tags use the same indigo styling
  const getStatusStyle = () => {
    return 'bg-[#4f46e5] text-white';
  };
  
  // Get status text based on booking status and time
  const getStatusText = (status: string, date: Date) => {
    const now = new Date();
    const bookingDate = date instanceof Date ? date : new Date(date);
    const endTime = new Date(bookingDate);
    endTime.setMinutes(endTime.getMinutes() + 60); // Assuming 60 min as default
    
    // Check if this is an active booking
    if (now >= bookingDate && now <= endTime && status.toUpperCase() === 'SCHEDULED') {
      return 'Active Now';
    } else if (status === 'CANCELLED') {
      return 'Cancelled';
    } else if (status === 'COMPLETED') {
      return 'Completed';
    } else if (bookingDate < now) {
      return 'Ended';
    } else {
      return 'Upcoming';
    }
  };

  const displayBookings = showAll ? bookings : bookings.slice(0, 2);
  const hasMoreBookings = bookings.length > 2;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Your upcoming call with {expertName || 'this expert'}
        </h3>
        {hasMoreBookings && (
          <Link href="/bookings" className="text-sm text-indigo-600 hover:text-indigo-800">
            View all
          </Link>
        )}
      </div>
      
      <div className="space-y-3">
        {displayBookings.map((booking) => {
          const bookingDate = booking.scheduledAt as Date;
          const endTime = new Date(bookingDate);
          endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
          
          return (
            <div 
              key={booking.id} 
              className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#4f46e5] text-white">
                    {getStatusText(booking.status, bookingDate)}
                  </span>
                  <p className="font-medium text-gray-900">{formatDate(bookingDate)}</p>
                  <p className="text-sm text-gray-600">
                    {formatTime(bookingDate)} - {formatTime(endTime)} ({booking.durationMinutes} min)
                  </p>
                </div>
                
                {/* The arrow link to bookings page has been removed */}
              </div>
              
              {/* Show Join Call button at the bottom for active bookings */}
              {activeBookings[booking.id] && (
                <div className="mt-4">
                  <button 
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors cursor-pointer"
                    onClick={() => window.open(`/video-calls/${booking.id}`, '_blank')}
                  >
                    <VideoCameraIcon className="h-5 w-5 mr-2" />
                    Join Call
                  </button>
                </div>
              )}
            </div>
          );
        })}
        
        {hasMoreBookings && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 text-center border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Show {bookings.length - 2} more booking{bookings.length - 2 > 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
}
