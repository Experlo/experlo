'use client';

import { useState, useEffect } from 'react';
import { CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { SerializedExpert } from '@/types/expert';

interface DateSelectionProps {
  expert: SerializedExpert;
  selectedDuration: number;
  onSelectDate: (date: Date) => void;
  onBack: () => void;
}

export default function DateSelection({ expert, selectedDuration, onSelectDate, onBack }: DateSelectionProps) {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        setLoading(true);
        // This would normally be an API call to get available dates
        // For now, we'll simulate it with dates for the next 14 days
        const dates: Date[] = [];
        const today = new Date();
        
        for (let i = 1; i <= 14; i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);
          // Skip weekends for this example
          if (date.getDay() !== 0 && date.getDay() !== 6) {
            dates.push(date);
          }
        }
        
        setAvailableDates(dates);
      } catch (error) {
        console.error('Error fetching available dates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableDates();
  }, [expert.id, selectedDuration]);

  // Group dates by month
  const groupedDates: Record<string, Date[]> = {};
  availableDates.forEach(date => {
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groupedDates[monthYear]) {
      groupedDates[monthYear] = [];
    }
    groupedDates[monthYear].push(date);
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
          Choose a date for your {selectedDuration}-minute session with {expert.user.firstName}.
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDates).map(([monthYear, dates]) => (
            <div key={monthYear}>
              <h3 className="text-md font-medium text-gray-900 mb-3">{monthYear}</h3>
              <div className="grid grid-cols-3 gap-2">
                {dates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => onSelectDate(date)}
                    className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                  >
                    <span className="text-xs text-gray-500">
                      {date.toLocaleString('default', { weekday: 'short' })}
                    </span>
                    <span className="font-semibold text-lg">
                      {date.getDate()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
