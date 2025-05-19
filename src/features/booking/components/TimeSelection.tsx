'use client';

import { useState, useEffect } from 'react';
import { ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { SerializedExpert } from '@/types/expert';

interface TimeSelectionProps {
  expert: SerializedExpert;
  selectedDate: Date;
  durationMinutes: number;
  onSelectTime: (timeSlot: { startTime: string; endTime: string }) => void;
  onBack: () => void;
}

interface TimeSlot {
  startTime: string; // ISO string
  endTime: string; // ISO string
  formattedStart: string; // Formatted for display
  formattedEnd: string; // Formatted for display
}

export default function TimeSelection({ 
  expert, 
  selectedDate, 
  durationMinutes, 
  onSelectTime, 
  onBack 
}: TimeSelectionProps) {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      try {
        setLoading(true);

        // In a real application, this would be an API call to get available time slots
        // for the selected date and expert, considering the requested duration
        
        // For now, we'll simulate it with some time slots throughout the day
        const simulatedTimeSlots: TimeSlot[] = [];
        
        // Create time slots from 9 AM to 5 PM, every hour
        for (let hour = 9; hour < 17; hour++) {
          // Clone the selected date and set the hour
          const startTime = new Date(selectedDate);
          startTime.setHours(hour, 0, 0, 0);
          
          // Calculate end time based on duration
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + durationMinutes);
          
          // Format times for display
          const formattedStart = startTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          
          const formattedEnd = endTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          
          // Add to available time slots
          simulatedTimeSlots.push({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            formattedStart,
            formattedEnd,
          });
        }
        
        // Filter out time slots that overlap with existing bookings
        // This would be handled server-side in a real implementation
        
        setAvailableTimeSlots(simulatedTimeSlots);
      } catch (error) {
        console.error('Error fetching available time slots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableTimeSlots();
  }, [expert.id, selectedDate, durationMinutes]);

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
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
        <div>
          <p className="text-sm text-gray-500">
            Choose a time for your {durationMinutes}-minute session.
          </p>
          <p className="font-medium text-gray-900">{formattedDate}</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {availableTimeSlots.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No available time slots for this date. Please try another date.
            </p>
          ) : (
            availableTimeSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => onSelectTime({
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
              >
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="font-medium">{slot.formattedStart} - {slot.formattedEnd}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
