'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { SerializedExpert } from '@/types/expert';
import DurationSelection from '@/features/booking/components/DurationSelection';
import DateSelection from '@/features/booking/components/DateSelection';
import TimeSelection from '@/features/booking/components/TimeSelection';
import BookingConfirmation from '@/features/booking/components/BookingConfirmation';

type BookingStep = 'duration' | 'date' | 'time' | 'confirmation';

interface BookingModalProps {
  expert: SerializedExpert;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ expert, isOpen, onClose }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('duration');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState({
    expertId: expert.id,
    durationMinutes: 60,
    selectedDate: null as Date | null,
    selectedTimeSlot: null as { startTime: string; endTime: string } | null,
    totalPrice: 0,
  });

  const handleSetDuration = (durationMinutes: number) => {
    // Calculate price based on the expert's hourly rate and duration
    const hourlyRate = expert.pricePerHour;
    const totalPrice = (hourlyRate / 60) * durationMinutes;
    
    setBookingData({
      ...bookingData,
      durationMinutes,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    });
    setCurrentStep('date');
  };

  const handleSetDate = (date: Date) => {
    setBookingData({
      ...bookingData,
      selectedDate: date,
      // Reset selected time when date changes
      selectedTimeSlot: null,
    });
    setCurrentStep('time');
  };

  const handleSetTime = (timeSlot: { startTime: string; endTime: string }) => {
    setBookingData({
      ...bookingData,
      selectedTimeSlot: timeSlot,
    });
    setCurrentStep('confirmation');
  };

  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true);
      setBookingError(null);
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expertId: bookingData.expertId,
          scheduledAt: bookingData.selectedTimeSlot?.startTime,
          durationMinutes: bookingData.durationMinutes,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Booking successful
      setBookingSuccess(true);
      
      // Reset booking form data but don't close modal yet (we'll show success message)
      setBookingData({
        expertId: expert.id,
        durationMinutes: 60,
        selectedDate: null,
        selectedTimeSlot: null,
        totalPrice: 0,
      });
      
      // After 3 seconds, close the modal
      setTimeout(() => {
        onClose();
        setBookingSuccess(false);
        setCurrentStep('duration');
      }, 3000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setBookingError(error instanceof Error ? error.message : 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    switch (currentStep) {
      case 'date':
        setCurrentStep('duration');
        break;
      case 'time':
        setCurrentStep('date');
        break;
      case 'confirmation':
        setCurrentStep('time');
        break;
      default:
        break;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'duration':
        return (
          <DurationSelection 
            expert={expert} 
            onSelectDuration={handleSetDuration} 
          />
        );
      case 'date':
        return (
          <DateSelection 
            expert={expert} 
            selectedDuration={bookingData.durationMinutes} 
            onSelectDate={handleSetDate} 
            onBack={goBack}
          />
        );
      case 'time':
        return (
          <TimeSelection 
            expert={expert} 
            selectedDate={bookingData.selectedDate!} 
            durationMinutes={bookingData.durationMinutes} 
            onSelectTime={handleSetTime} 
            onBack={goBack}
          />
        );
      case 'confirmation':
        return (
          <BookingConfirmation 
            expert={expert} 
            bookingData={bookingData} 
            onConfirm={handleConfirmBooking} 
            onBack={goBack}
          />
        );
      default:
        return null;
    }
  };

  if (bookingSuccess) {
    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white shadow-xl w-full">
              <div className="p-6 text-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <Dialog.Title className="text-xl font-semibold text-gray-900 mb-2">
                  Booking Confirmed!
                </Dialog.Title>
                <p className="text-gray-600 mb-6">
                  Your session with {expert.user.firstName} has been scheduled successfully.
                  You can view all your bookings in the "My Bookings" section.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen scrollable container */}
      <div className="fixed inset-0 overflow-y-auto">
        {/* Container to center the panel */}
        <div className="flex min-h-full items-center justify-center p-4">
          {/* The actual dialog panel */}
          <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white shadow-xl w-full">
            <div className="relative">
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              
              <div className="p-6">
                <Dialog.Title className="text-xl font-semibold text-gray-900 mb-1">
                  Book a Session with {expert.user.firstName}
                </Dialog.Title>
                <p className="text-sm text-gray-500 mb-6">
                  {currentStep === 'duration' && "Select the session duration"}
                  {currentStep === 'date' && "Choose a date for your session"}
                  {currentStep === 'time' && "Pick a time that works for you"}
                  {currentStep === 'confirmation' && "Review and confirm your booking"}
                </p>
                
                {bookingError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                    {bookingError}
                  </div>
                )}
                
                {isSubmitting ? (
                  <div className="py-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  renderStepContent()
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
