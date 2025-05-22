'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import JoinCallButton from '@/features/video/components/JoinCallButton';

// Booking type definition
export interface BookingCardProps {
  booking: {
    id: string;
    scheduledAt: Date | string;
    durationMinutes: number;
    status: string;
    role?: 'client' | 'expert';
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
    expertId?: string;
    expertName?: string;
    userId?: string;
    clientName?: string;
  };
}

export default function BookingCard({ booking }: BookingCardProps) {
  // Debug logging
  console.log('BookingCard rendering with booking:', booking);
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

  // Determine if it's a client or expert booking
  const isClientBooking = booking.role === 'client' || !booking.role;
  
  // Format date and time for display
  const bookingDate = new Date(booking.scheduledAt);
  const endTime = new Date(bookingDate);
  endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
  
  const formattedDate = formatDate(bookingDate);
  const formattedTime = formatTime(bookingDate);
  const formattedEndTime = formatTime(endTime);

  // Get participant info (the other person in the call)
  let participant;
  
  if (isClientBooking) {
    // If client role, the participant is the expert
    if (booking.expert) {
      participant = booking.expert;
    } else if (booking.expertId || booking.expertName) {
      participant = { 
        id: booking.expertId || '', 
        name: booking.expertName || 'Expert', 
        title: 'Expert',
        photo: null 
      };
    } else {
      participant = { id: '', name: 'Expert', title: 'Expert', photo: null };
    }
  } else {
    // If expert role, the participant is the client
    if (booking.client) {
      participant = booking.client;
    } else if (booking.userId || booking.clientName) {
      participant = { 
        id: booking.userId || '', 
        name: booking.clientName || 'Client', 
        title: 'Client',
        photo: null 
      };
    } else {
      participant = { id: '', name: 'Client', title: 'Client', photo: null };
    }
  }

  // Status display
  const getStatusDisplay = () => {
    const status = booking.status.toUpperCase();
    
    let bgColor, textColor, icon = null;
    switch (status) {
      case 'SCHEDULED':
        bgColor = 'bg-indigo-100';
        textColor = 'text-indigo-800';
        break;
      case 'IN_PROGRESS':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'COMPLETED':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'CANCELLED':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {status}
      </span>
    );
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="p-6 space-y-3 bg-white rounded-lg shadow-sm border border-gray-200">
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
              <div className={`h-full w-full rounded-full overflow-hidden shadow-sm flex items-center justify-center ${isClientBooking ? 'bg-gradient-to-br from-[#6366f1] to-[#4f46e5]' : 'bg-gradient-to-br from-[#ec4899] to-[#db2777]'}`}>
                <span className="text-base font-semibold text-white">
                  {participant.name?.split(' ').slice(0, 2).map(n => n[0] || '').join('') || 'UN'}
                </span>
              </div>
            )}
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              {isClientBooking ? (
                <Link href={`/experts/${participant.id}`} className="text-indigo-600 hover:text-indigo-900">
                  {participant.name}
                </Link>
              ) : (
                <Link href={`/profile/${participant.id}`} className="text-indigo-600 hover:text-indigo-900">
                  {participant.name}
                </Link>
              )}
            </h4>
            <p className="text-sm text-gray-500">{(participant.title !== undefined ? participant.title : (isClientBooking ? 'Expert' : 'Client'))}</p>
            <p className="text-sm text-gray-700 mt-1">{formattedDate}</p>
            <p className="text-sm text-gray-600">{formattedTime} - {formattedEndTime}</p>
            <p className="text-xs text-gray-500">{booking.durationMinutes} minutes</p>
          </div>
        </div>
        
        {/* Join Call Button or Status Badge */}
        {booking.status.toUpperCase() === 'SCHEDULED' || booking.status.toUpperCase() === 'IN_PROGRESS' ? (
          <JoinCallButton booking={{
            id: booking.id,
            scheduledAt: booking.scheduledAt,
            durationMinutes: booking.durationMinutes,
            status: booking.status
          }} />
        ) : (
          statusDisplay
        )}
      </div>
      
      {/* No additional content needed here since date/time info was moved above */}
    </div>
  );
}
