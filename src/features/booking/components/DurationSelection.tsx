'use client';

import { ClockIcon } from '@heroicons/react/24/outline';
import { SerializedExpert } from '@/types/expert';

interface DurationSelectionProps {
  expert: SerializedExpert;
  onSelectDuration: (durationMinutes: number) => void;
}

// Available durations in minutes
const AVAILABLE_DURATIONS = [30, 60, 90];

export default function DurationSelection({ expert, onSelectDuration }: DurationSelectionProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Select how long you'd like your session with {expert.user.firstName} to be.
      </p>
      
      <div className="space-y-4">
        {AVAILABLE_DURATIONS.map((duration) => {
          // Calculate price based on expert's hourly rate
          const hourlyRate = expert.pricePerHour;
          const price = (hourlyRate / 60) * duration;
          
          return (
            <button
              key={duration}
              onClick={() => onSelectDuration(duration)}
              className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all"
            >
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="font-medium">{duration} minutes</span>
              </div>
              <span className="font-semibold">${price.toFixed(2)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
