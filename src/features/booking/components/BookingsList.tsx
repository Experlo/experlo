'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { VideoCameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// Date formatting functions
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

interface Booking {
  id: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  status: string;
  role: 'client' | 'expert'; // the role of the current user viewing the booking
  expertId?: string;
  expertName?: string;
  userId?: string;
  clientName?: string;
  // Enhanced fields for improved UI
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

export default function BookingsList({ bookings, emptyMessage, onRefresh }: BookingsListProps) {
  const [activeBookings, setActiveBookings] = useState<{[key: string]: boolean}>({});
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  
  // Sort bookings by date
  useEffect(() => {
    // Sort bookings by date - future bookings first
    const sortedBookings = [...bookings].sort((a, b) => {
      // Get date objects
      const dateA = new Date(a.scheduledAt);
      const dateB = new Date(b.scheduledAt);
      
      // Sort by scheduled date (future first)
      return dateA.getTime() - dateB.getTime();
    });
  }, [bookings]);
  
  // Function to check if a booking is active and update statuses
  useEffect(() => {
    const checkActiveBookings = () => {
      const now = new Date();
      
      // Create a new activeBookings object
      const newActiveBookings: {[key: string]: boolean} = {};
      let statusesNeedUpdate = false;
      
      bookings.forEach(booking => {
        // Skip if not scheduled
        if (booking.status.toUpperCase() !== 'SCHEDULED') return;
        
        const startTime = new Date(booking.scheduledAt);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
        
        // Check if current time is between start and end time
        if (now >= startTime && now <= endTime) {
          newActiveBookings[booking.id] = true;
        }
        
        // Check if booking has ended and needs status update
        if (now > endTime && booking.status.toUpperCase() === 'SCHEDULED') {
          statusesNeedUpdate = true;
        }
      });
      
      setActiveBookings(newActiveBookings);
      console.log('Active bookings:', newActiveBookings);
      
      // If any booking has ended, call the API to update statuses (but not too frequently)
      if (statusesNeedUpdate) {
        // Use debounce to prevent multiple calls in quick succession
        const now = new Date().getTime();
        // Only update statuses if we haven't done so in the last 60 seconds
        if (!window.lastStatusUpdate || (now - window.lastStatusUpdate) > 60000) {
          window.lastStatusUpdate = now;
          updateBookingStatuses();
        }
      }
    };
    
    // Function to update booking statuses via API
    const updateBookingStatuses = async () => {
      try {
        const response = await fetch('/api/bookings/status');
        if (response.ok) {
          // After updating statuses, refresh the bookings list
          if (onRefresh) {
            onRefresh();
          }
        }
      } catch (error) {
        console.error('Error updating booking statuses:', error);
      }
    };
    
    // Check immediately
    checkActiveBookings();
    
    // Set up interval - check every 15 seconds for more responsive UI
    const interval = setInterval(checkActiveBookings, 15000);
    
    return () => clearInterval(interval);
  }, [bookings, onRefresh]);

  // Helper function to get booking status text and style
  const getStatusDisplay = (booking: Booking) => {
    const now = new Date();
    const startTime = new Date(booking.scheduledAt);
    const endTime = new Date(startTime.getTime());
    endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
    
    let statusText = '';
    
    if (now >= startTime && now <= endTime) {
      statusText = 'Active Now';
    } else if (now < startTime) {
      statusText = 'Upcoming';
    } else if (booking.status.toUpperCase() === 'COMPLETED') {
      statusText = 'Completed';
    } else {
      statusText = 'Missed';
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#4f46e5] text-white">
        {statusText}
      </span>
    );
  };

  // Function to render a booking card
  const renderBookingCard = (booking: Booking) => {
    const formattedDate = formatDate(new Date(booking.scheduledAt));
    const formattedTime = formatTime(new Date(booking.scheduledAt));
    const endTime = new Date(new Date(booking.scheduledAt).getTime() + booking.durationMinutes * 60000);
    const formattedEndTime = formatTime(endTime);
    
    // Create participant objects for both expert and client regardless of role
    const expert = booking.expert || { 
      id: booking.expertId || '', 
      name: booking.expertName || 'Expert', 
      title: '',
      photo: null // Changed from default image to null
    };
    
    const client = booking.client || { 
      id: booking.userId || '', 
      name: booking.clientName || 'Client', 
      title: '',
      photo: null // Changed from default image to null
    };
    
    // For display purposes - always show the other party in the booking
    // If user is client, show expert; if user is expert, show client
    const participant = booking.role === 'client' ? expert : client;
    
    const statusDisplay = getStatusDisplay(booking);
    
    return (
      <div key={booking.id} className="p-6 space-y-3 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="relative h-12 w-12 flex-shrink-0">
              {participant.photo ? (
                <div className="h-full w-full rounded-full overflow-hidden shadow-sm">
                  <div className="relative h-full w-full">
                    <Image
                      src={participant.photo}
                      alt={`${participant.name}'s profile`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className={`h-full w-full rounded-full overflow-hidden shadow-sm flex items-center justify-center ${booking.role === 'client' ? 'bg-gradient-to-br from-[#6366f1] to-[#4f46e5]' : 'bg-gradient-to-br from-[#ec4899] to-[#db2777]'}`}>
                  <span className="text-base font-semibold text-white">
                    {participant.name.split(' ').slice(0, 2).map(n => n[0] || '').join('')}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {booking.role === 'client' ? (
                  <Link href={`/experts/${expert.id}`} className="text-indigo-600 hover:text-indigo-900">
                    {expert.name}
                  </Link>
                ) : (
                  <Link href={`/profile/${client.id}`} className="text-indigo-600 hover:text-indigo-900">
                    {client.name}
                  </Link>
                )}
              </h4>
              <p className="text-sm text-gray-500">{participant.title}</p>
            </div>
          </div>
          
          {/* Join Call Button or Status Badge */}
          {activeBookings[booking.id] ? (
            <button 
              className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
              onClick={() => window.open(`/video-calls/${booking.id}`, '_blank')}
            >
              <VideoCameraIcon className="h-4 w-4 mr-1" />
              Join Call
            </button>
          ) : (
            statusDisplay
          )}
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-700">{formattedDate}</p>
            <p className="text-gray-600">{formattedTime} - {formattedEndTime}</p>
            <p className="text-gray-500 text-xs">{booking.durationMinutes} minutes</p>
          </div>
        </div>
      </div>
    );
  };
  
  if (bookings.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map(booking => renderBookingCard(booking))}
    </div>
  );
}
