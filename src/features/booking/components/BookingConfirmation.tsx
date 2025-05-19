'use client';

import { useState } from 'react';
import { CalendarIcon, ClockIcon, CheckIcon, ArrowLeftIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { SerializedExpert } from '@/types/expert';

interface BookingConfirmationProps {
  expert: SerializedExpert;
  bookingData: {
    expertId: string;
    durationMinutes: number;
    selectedDate: Date | null;
    selectedTimeSlot: { startTime: string; endTime: string } | null;
    totalPrice: number;
  };
  onConfirm: () => Promise<void>;
  onBack: () => void;
}

export default function BookingConfirmation({ 
  expert, 
  bookingData, 
  onConfirm, 
  onBack 
}: BookingConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { durationMinutes, selectedTimeSlot, totalPrice } = bookingData;
  
  if (!selectedTimeSlot) {
    return <div>Error: No time slot selected</div>;
  }
  
  // Format date and time for display
  const startTime = new Date(selectedTimeSlot.startTime);
  const endTime = new Date(selectedTimeSlot.endTime);
  
  const formattedDate = startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  const formattedStartTime = startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  
  const formattedEndTime = endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button 
          onClick={onBack}
          className="mr-3 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <p className="text-sm text-gray-500">
          Review and confirm your booking
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium">{formattedDate}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <ClockIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium">{formattedStartTime} - {formattedEndTime}</p>
            <p className="text-sm text-gray-500">{durationMinutes} minutes</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Expert Information</p>
          <div className="flex items-center">
            {expert.user.image ? (
              <img 
                src={expert.user.image} 
                alt={`${expert.user.firstName} ${expert.user.lastName}`} 
                className="h-10 w-10 rounded-full object-cover mr-3"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <span className="text-indigo-800 font-medium">
                  {expert.user.firstName.charAt(0)}{expert.user.lastName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium">{expert.user.firstName} {expert.user.lastName}</p>
              <p className="text-sm text-gray-500">{expert.title}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-50 p-3 rounded-md mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CreditCardIcon className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-gray-700">Session fee</span>
            </div>
            <span className="font-semibold">${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <button
          onClick={async () => {
            setIsLoading(true);
            try {
              await onConfirm();
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <span className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></span>
              Processing...
            </>
          ) : (
            <>
              <CheckIcon className="h-5 w-5 mr-2" />
              Confirm Booking
            </>
          )}
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          By confirming, you agree to our Terms of Service and cancellation policy.
          You can cancel for free up to 24 hours before your session.
        </p>
      </div>
    </div>
  );
}
