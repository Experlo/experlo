'use client';

import { useState } from 'react';
import { Calendar } from '@/shared/components/ui/Calendar';
import { format } from 'date-fns';
import { Button } from '@/shared/components/ui/Button';
import { TimeSlot } from '@/types/schema';

interface DateTimePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  expertId: string;
  duration: number;
}

export default function DateTimePicker({
  selectedDate,
  onDateSelect,
  expertId,
  duration,
}: DateTimePickerProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAvailableSlots = async (date: Date) => {
    setIsLoading(true);
    console.log('Loading slots for date:', date);
    try {
      const url = `/api/experts/${expertId}/availability?date=${date.toISOString()}&duration=${duration}`;
      console.log('Fetching from URL:', url);
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to load available slots');
      }
      const { timeSlots } = await response.json();
      console.log('Received slots:', timeSlots);
      setAvailableSlots(timeSlots);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: Date | null) => {
    console.log('Date selected:', date);
    if (date) {
      // Set the time to noon to avoid timezone issues
      const dateAtNoon = new Date(date);
      dateAtNoon.setHours(12, 0, 0, 0);
      onDateSelect(dateAtNoon);
      loadAvailableSlots(dateAtNoon);
    } else {
      onDateSelect(null);
      setAvailableSlots([]);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">Select Date & Time</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            required={false}
            selected={selectedDate || undefined}
            onSelect={(date) => handleDateChange(date || null)}
            disabled={(date: Date) => date < new Date()}
            className="rounded-md border"
          />
        </div>
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.startTime}
                  variant={selectedDate?.toISOString() === slot.startTime ? 'default' : 'outline'}
                  onClick={() => onDateSelect(new Date(slot.startTime))}
                >
                  {format(new Date(slot.startTime), 'h:mm a')}
                </Button>
              ))}
            </div>
          ) : selectedDate ? (
            <p className="text-gray-500 text-center">No available slots for this date.</p>
          ) : (
            <p className="text-gray-500 text-center">Please select a date to view available time slots.</p>
          )}
        </div>
      </div>
    </div>
  );
}
