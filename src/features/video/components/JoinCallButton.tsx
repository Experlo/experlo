'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/Button';
import { VideoCameraIcon } from '@heroicons/react/24/outline';

interface JoinCallButtonProps {
  booking: {
    id: string;
    scheduledAt: Date | string;
    durationMinutes: number;
    status: string;
  };
}

export default function JoinCallButton({ booking }: JoinCallButtonProps) {
  const router = useRouter();
  const [isCallActive, setIsCallActive] = useState(false);
  const [minutesToStart, setMinutesToStart] = useState<number | null>(null);
  
  // Check if call is active (current time is between start and end time)
  useEffect(() => {
    const checkCallStatus = () => {
      const now = new Date();
      const scheduledAt = new Date(booking.scheduledAt);
      const endTime = new Date(scheduledAt.getTime() + booking.durationMinutes * 60 * 1000);
      
      // Allow joining 5 minutes before scheduled time
      const earlyJoinTime = new Date(scheduledAt.getTime() - 5 * 60 * 1000);
      
      if (now >= earlyJoinTime && now <= endTime) {
        setIsCallActive(true);
        setMinutesToStart(null);
      } else if (now < earlyJoinTime) {
        setIsCallActive(false);
        const timeToStart = Math.ceil((earlyJoinTime.getTime() - now.getTime()) / (60 * 1000));
        setMinutesToStart(timeToStart);
      } else {
        setIsCallActive(false);
        setMinutesToStart(null);
      }
    };
    
    // Initial check
    checkCallStatus();
    
    // Set up interval to check every 30 seconds
    const interval = setInterval(checkCallStatus, 30000);
    
    return () => clearInterval(interval);
  }, [booking]);
  
  // Handle join call
  const handleJoinCall = () => {
    router.push(`/video-calls/${booking.id}`);
  };
  
  if (booking.status !== 'SCHEDULED' && booking.status !== 'IN_PROGRESS') {
    return null;
  }
  
  if (!isCallActive) {
    if (minutesToStart !== null) {
      return (
        <div className="flex flex-col items-end">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <VideoCameraIcon className="w-3.5 h-3.5 mr-1" />
            Available in {minutesToStart} min
          </span>
          <p className="text-xs text-gray-500 mt-1">You can join 5 minutes before the scheduled time</p>
        </div>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <VideoCameraIcon className="w-3.5 h-3.5 mr-1" />
        CALL ENDED
      </span>
    );
  }
  
  return (
    <Button 
      onClick={handleJoinCall}
      variant="default"
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer"
    >
      <VideoCameraIcon className="w-3.5 h-3.5 mr-1 font-bold" />
      Join Call Now
    </Button>
  );
}
