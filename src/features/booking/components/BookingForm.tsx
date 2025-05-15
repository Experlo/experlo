'use client';

import { useState } from 'react';
import { TimeSlot } from '@/types/schema';
import { SerializedExpert } from '@/types/expert';
import DateTimePicker from './DateTimePicker';
import { Button } from '@/shared/components/ui/Button';
import { toast } from 'react-hot-toast';

interface BookingFormProps {
  expert: SerializedExpert;
}

export default function BookingForm({ expert }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [isBooking, setIsBooking] = useState(false);

  const minuteRate = expert.pricePerHour / 60;

  const durations = [
    { minutes: 15, price: minuteRate * 15 },
    { minutes: 30, price: minuteRate * 30 },
    { minutes: 45, price: minuteRate * 45 },
    { minutes: 60, price: minuteRate * 60, label: '1 hour' },
  ];

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date || null);
  };

  const handleDurationSelect = (minutes: number) => {
    setSelectedDuration(minutes);
    setSelectedDate(null); // Reset date when duration changes
  };



  const handleBooking = async () => {
    if (!selectedDate) return;

    setIsBooking(true);
    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expertId: expert.id,
          duration: selectedDuration,
          startTime: selectedDate.toISOString(),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to book the session');
      }

      // Show success message
      toast.success(
        <div>
          <h3 className="font-medium">Booking Confirmed!</h3>
          <p className="text-sm">Your session with {expert.name} has been scheduled.</p>
        </div>
      );

      // Reset form
      setSelectedDate(null);
      setSelectedDuration(30);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to book the session');
      console.error('Booking error:', error);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Duration Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Duration</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {durations.map((duration) => (
            <Button
              key={duration.minutes}
              variant={selectedDuration === duration.minutes ? 'default' : 'outline'}
              onClick={() => handleDurationSelect(duration.minutes)}
              className="justify-between"
            >
              <span>{duration.label || `${duration.minutes} min`}</span>
              <span>${duration.price}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Date and Time Selection */}
      <DateTimePicker
        selectedDate={selectedDate}
        expertId={expert.id}
        onDateSelect={handleDateSelect}
        duration={selectedDuration}
      />

      {/* Booking Button */}
      {selectedDate && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">Total Cost:</span>
            <span className="text-lg font-semibold text-gray-900">
              ${(expert.pricePerHour / 60) * selectedDuration}
            </span>
          </div>
          <Button
            onClick={handleBooking}
            className="w-full"
            disabled={isBooking}
            variant="default"
          >
            {isBooking ? 'Booking...' : 'Book Session'}
          </Button>
        </div>
      )}
    </div>
  );
}
