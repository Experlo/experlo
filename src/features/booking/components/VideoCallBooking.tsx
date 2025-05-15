'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { DayPicker } from 'react-day-picker';
import { SerializedExpert } from '@/types/expert';
import { format, parse, isValid, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface VideoCallBookingProps {
  expert: SerializedExpert;
  onClose: () => void;
}

type BookingStep = 'duration' | 'date' | 'time' | 'confirm';

export default function VideoCallBooking({ expert, onClose }: VideoCallBookingProps) {
  // Use mock user data
  const mockUser = {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe'
  };
  const [step, setStep] = useState<BookingStep>('duration');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  interface TimeSlot {
    startTime: string;
    endTime: string;
  }

  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const durations = [
    { minutes: 15, price: (expert.pricePerHour / 60) * 15, label: '15 min' },
    { minutes: 30, price: (expert.pricePerHour / 60) * 30, label: '30 min' },
    { minutes: 60, price: expert.pricePerHour, label: '60 min' },
  ];

  const handleDurationSelect = (minutes: number) => {
    setSelectedDuration(minutes);
    setStep('date');
  };

  type AvailabilitySlot = {
    startTime: string;
    endTime: string;
  };

  const fetchAvailability = async (date: Date, duration: number): Promise<{ timeSlots: AvailabilitySlot[] }> => {
    // Mock availability data
    const mockTimeSlots = [
      { startTime: '09:00', endTime: '09:30' },
      { startTime: '10:00', endTime: '10:30' },
      { startTime: '11:00', endTime: '11:30' },
      { startTime: '14:00', endTime: '14:30' },
      { startTime: '15:00', endTime: '15:30' }
    ];
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ timeSlots: mockTimeSlots });
      }, 500);
    });
  };

  const handleDateSelect = async (date: Date | undefined) => {
    console.log('Fetching availability for date:', date, selectedDuration);

    if (!date || !selectedDuration) {
      setAvailableTimeSlots([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchAvailability(date, selectedDuration);
      setAvailableTimeSlots(data.timeSlots);
      
      if (data.timeSlots.length === 0) {
        toast.info('No available time slots for selected date');
      }
      setStep('time');

    } catch (error) {
      console.error('Error fetching time slots:', error);
      toast.error('Failed to load available time slots. Please try again.');
      setAvailableTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSelect = (timeSlot: { startTime: string; endTime: string }) => {
    setSelectedTime(timeSlot.startTime);
    setStep('confirm');
  };

  const handleBack = () => {
    switch (step) {
      case 'date':
        setStep('duration');
        setSelectedDate(undefined);
        break;
      case 'time':
        setStep('date');
        setSelectedTime(undefined);
        break;
      case 'confirm':
        setStep('time');
        break;
    }
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !selectedDuration) return;

    setIsLoading(true);
    try {
      const startTime = parse(selectedTime, 'HH:mm', selectedDate);
      const endTime = new Date(startTime.getTime() + selectedDuration * 60 * 1000);

      // Mock booking confirmation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockBooking = {
        startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        userId: mockUser.id,
        expertId: expert.id,
        duration: selectedDuration
      };

      console.log('Mock booking created:', mockBooking);
      toast.success('Booking confirmed!');
      onClose();
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to confirm booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDurationStep = () => (
    <div className="p-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Select Duration</h3>
      <div className="grid grid-cols-3 gap-3">
        {durations.map(({ minutes, price, label }) => (
          <button
            key={minutes}
            onClick={() => handleDurationSelect(minutes)}
            className={`p-4 rounded-lg border text-center transition-colors cursor-pointer
              ${selectedDuration === minutes
                ? 'bg-primary text-white border-primary'
                : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
          >
            <div className="font-medium">{label}</div>
            <div className="text-sm opacity-75">${price}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDateStep = () => (
    <div className="p-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Select Date</h3>
      <div className="max-w-sm mx-auto">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date);
            if (date) handleDateSelect(date);
          }}
          disabled={[
            { before: new Date() },
            (date) => date.getDay() === 0 || date.getDay() === 6 // Disable weekends
          ]}
          fromDate={new Date()}
          toDate={new Date(new Date().setMonth(new Date().getMonth() + 3))} // Allow booking up to 3 months ahead
          showOutsideDays={false}
          weekStartsOn={1}
          fixedWeeks
          modifiers={{
            today: new Date(),
            booked: [], // Add booked dates here
          }}
          modifiersStyles={{
            booked: {
              textDecoration: 'line-through',
              color: 'var(--muted)',
            },
          }}
          className="border rounded-lg bg-white shadow-sm p-3"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 cursor-pointer",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
            row: "flex w-full mt-2",
            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal hover:bg-accent focus:bg-accent focus:outline-none cursor-pointer",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary",
            day_today: "font-semibold underline",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
            day_hidden: "invisible",
          }}
        />
      </div>
    </div>
  );

  const renderTimeStep = () => (
    <div className="p-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">Select Time</h3>
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : availableTimeSlots.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {availableTimeSlots.map((timeSlot) => (
            <button
              key={timeSlot.startTime}
              onClick={() => handleTimeSelect(timeSlot)}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer
                ${selectedTime === timeSlot.startTime 
                  ? 'bg-primary text-white' 
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
            >
              {timeSlot.startTime} - {timeSlot.endTime}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          {selectedDate ? 'No available time slots for this date.' : 'Please select a date first.'}
        </p>
      )}
    </div>
  );

  const renderConfirmStep = () => {
    if (!selectedDuration || !selectedDate || !selectedTime) return null;

    const minuteRate = (expert.pricePerHour || 0) / 60;
    const totalPrice = minuteRate * selectedDuration;
    const formattedDate = format(selectedDate, 'MMMM d, yyyy');

    return (
      <div className="p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Confirm Booking</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">Expert</dt>
                <dd className="font-medium">{expert.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Date</dt>
                <dd className="font-medium">{formattedDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Time</dt>
                <dd className="font-medium">{selectedTime}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Duration</dt>
                <dd className="font-medium">{selectedDuration} minutes</dd>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <dt className="text-gray-900 font-medium">Total Price</dt>
                <dd className="font-medium text-primary">${Number(totalPrice.toFixed(2))}</dd>
              </div>
            </dl>
          </div>
          <Button
            onClick={handleConfirm}
            className="w-full cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            {step !== 'duration' && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold">Book a Consultation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'duration' && renderDurationStep()}
        {step === 'date' && renderDateStep()}
        {step === 'time' && renderTimeStep()}
        {step === 'confirm' && renderConfirmStep()}
      </div>
    </div>
  );
}
