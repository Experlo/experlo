'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import BookingCard from './BookingCard';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/Button'
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // No longer needed as we only show one booking
  // const [showAll, setShowAll] = useState(false);
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
        
        // Current time for comparison
        const now = new Date();
        
        // Convert all booking dates to Date objects
        const bookingsWithDates = data.bookings.map((booking: Booking) => ({
          ...booking,
          scheduledAt: new Date(booking.scheduledAt)
        }));
        
        // Find any active sessions (happening right now)
        let activeSession = bookingsWithDates.find((booking: Booking) => {
          const startTime = booking.scheduledAt as Date;
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
          
          return now >= startTime && now <= endTime && 
                 booking.status.toUpperCase() === 'SCHEDULED';
        });
        
        // If no active session, find the next upcoming one
        if (!activeSession) {
          const upcomingBookings = bookingsWithDates
            .filter((booking: Booking) => {
              // Only include future bookings
              return (booking.scheduledAt as Date) > now && 
                     booking.status.toUpperCase() !== 'CANCELLED' &&
                     booking.status.toUpperCase() !== 'COMPLETED';
            })
            .sort((a: Booking, b: Booking) => 
              (a.scheduledAt as Date).getTime() - (b.scheduledAt as Date).getTime()
            );
            
          // Take only the first upcoming booking
          activeSession = upcomingBookings.length > 0 ? upcomingBookings[0] : null;
        }
        
        // Set the bookings array to either have the single active/upcoming session or be empty
        setBookings(activeSession ? [activeSession] : []);
        
        // Get the expert's name if available
        if (activeSession && activeSession.expertName) {
          setExpertName(activeSession.expertName);
        }
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
      day: 'numeric'
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

  // We're only showing a single booking now (most immediate one)  
  return (
    <div className="mt-6">
      {bookings.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {bookings[0].scheduledAt > new Date() ? 'Your next session' : 'Your active session'}
          </h3>
          
          <div className="space-y-6">
            {bookings.map((booking) => {
              const bookingDate = booking.scheduledAt as Date;
              const endTime = new Date(bookingDate);
              endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
              
              const now = new Date();
              const isActive = now >= bookingDate && now <= endTime && booking.status.toUpperCase() === 'SCHEDULED';
              const minutesToStart = Math.max(0, Math.floor((bookingDate.getTime() - now.getTime()) / (1000 * 60)));
              
              return (
                <div key={booking.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="space-y-2">
                    {/* Top row: Date and Status badge (not button) */}
                    <div className="flex justify-between items-center">
                      <p className="text-gray-700 font-medium">
                        {formatDate(bookingDate)}
                      </p>
                      
                      {/* Status badge (only show for non-active calls) */}
                      {!isActive && (
                        bookingDate > now ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            UPCOMING
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            COMPLETED
                          </span>
                        )
                      )}
                    </div>
                    
                    {/* Middle row: Time */}
                    <p className="text-gray-600">
                      {formatTime(bookingDate)} - {formatTime(endTime)} 
                      <span className="text-gray-500 text-sm ml-2">({booking.durationMinutes} min)</span>
                    </p>
                    
                    {/* Help text row - only show for upcoming calls */}
                    {bookingDate > now && minutesToStart < 60 && (
                      <p className="text-xs text-gray-500">You can join 5 minutes before the scheduled time</p>
                    )}
                    
                    {/* Bottom row: Join Call button (only for active calls) */}
                    {isActive && (
                      <div className="mt-3 flex justify-center">
                            <Button 
                              onClick={() => router.push(`/video-calls/${booking.id}`)}
                              variant="default"
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer"
                            >
                              <VideoCameraIcon className="w-3.5 h-3.5 mr-1 font-bold" />
                              Join Call Now
                            </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
