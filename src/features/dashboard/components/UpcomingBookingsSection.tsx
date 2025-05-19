'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { VideoCameraIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';

interface Booking {
  id: string;
  expertId: string;
  expertName: string;
  scheduledAt: string | Date;
  durationMinutes: number;
  status: string;
  expert?: {
    id: string;
    name: string;
    title?: string;
    photo?: string;
  };
}

export default function UpcomingBookingsSection() {
  const { user } = useUser();
  const [nextBooking, setNextBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchUpcomingBooking = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch('/api/bookings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        const now = new Date();

        // Get all bookings (both as client and as expert if applicable)
        const allBookings = [...data.userBookings, ...(data.expertBookings || [])];
        
        // Format bookings with proper date objects
        const formattedBookings = allBookings.map((booking: any) => ({
          ...booking,
          scheduledAt: new Date(booking.scheduledAt)
        }));
        
        // Filter for upcoming and active bookings
        const upcomingBookings = formattedBookings.filter((booking: Booking) => {
          const startTime = booking.scheduledAt as Date;
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
          
          // Keep if it's in the future OR if it's currently active
          const isUpcoming = startTime > now;
          const isActive = now >= startTime && now <= endTime;
          
          return (isUpcoming || isActive) && 
                 booking.status.toUpperCase() === 'SCHEDULED';
        });
        
        // Sort by closest date first
        upcomingBookings.sort((a: Booking, b: Booking) => 
          (a.scheduledAt as Date).getTime() - (b.scheduledAt as Date).getTime()
        );
        
        // Take the next booking if available
        if (upcomingBookings.length > 0) {
          const booking = upcomingBookings[0];
          
          // Check if this booking is active now
          const startTime = booking.scheduledAt as Date;
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
          
          setIsActive(now >= startTime && now <= endTime);
          setNextBooking(booking);
        } else {
          setNextBooking(null);
        }
      } catch (error) {
        console.error('Error fetching upcoming booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingBooking();
    
    // Refresh every 30 seconds to update active status
    const interval = setInterval(fetchUpcomingBooking, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Helper functions for formatting dates and times
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse py-4 mt-8 bg-white rounded-lg p-6">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded mb-3"></div>
      </div>
    );
  }

  if (!nextBooking) {
    return null; // Don't show the section if there are no upcoming bookings
  }

  // Format date and time for display
  const bookingDate = nextBooking.scheduledAt as Date;
  const endTime = new Date(bookingDate);
  endTime.setMinutes(endTime.getMinutes() + nextBooking.durationMinutes);
  
  const formattedDate = formatDate(bookingDate);
  const formattedStartTime = formatTime(bookingDate);
  const formattedEndTime = formatTime(endTime);
  
  // Get expert info - set photo to null explicitly to trigger the initials fallback
  const expert = nextBooking.expert || {
    id: nextBooking.expertId,
    name: nextBooking.expertName,
    photo: null
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold text-gray-900">Your Upcoming Call</h2>
        <Link href="/bookings" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
          View all
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="relative h-12 w-12 flex-shrink-0">
              {expert.photo ? (
                <div className="h-full w-full rounded-full overflow-hidden shadow-sm">
                  <div className="relative h-full w-full">
                    <Image
                      src={expert.photo}
                      alt={`${expert.name}'s profile`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full w-full rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-gradient-to-br from-[#6366f1] to-[#4f46e5]">
                  <span className="text-base font-semibold text-white">
                    {expert.name.split(' ').slice(0, 2).map(n => n[0] || '').join('')}
                  </span>
                </div>
              )}
            </div>
            <div>
              <Link 
                href={`/experts/${expert.id}`} 
                className="text-md font-medium text-indigo-600 hover:text-indigo-900"
              >
                {expert.name}
              </Link>
              
              <p className="text-sm text-gray-600 mt-1">
                {formattedDate} · {formattedStartTime} - {formattedEndTime}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4f46e5] text-white">
              {isActive ? 'Active Now' : 'Upcoming'}
            </span>
          </div>
          
          {isActive && (
            <Link 
              href={`/video-calls/${nextBooking.id}`}
              target="_blank"
              className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <VideoCameraIcon className="h-4 w-4 mr-1.5" />
              Join Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
