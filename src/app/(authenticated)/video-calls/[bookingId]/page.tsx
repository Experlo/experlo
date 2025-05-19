'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { VideoCameraIcon, MicrophoneIcon, PhoneIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Booking {
  id: string;
  expertId: string;
  userId: string;
  expertName: string;
  clientName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
}

export default function VideoCallPage() {
  const { bookingId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real implementation, fetch the booking details from your API
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error('Could not find booking');
        }
        
        const data = await response.json();
        setBooking(data);
        
        // Calculate time remaining for the call
        const startTime = new Date(data.scheduledAt);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + data.durationMinutes);
        
        const now = new Date();
        const remainingMs = endTime.getTime() - now.getTime();
        
        if (remainingMs > 0) {
          setTimeRemaining(Math.floor(remainingMs / 60000)); // Convert to minutes
        } else {
          setError('This call has ended');
        }
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load call details');
      } finally {
        setLoading(false);
      }
    };
    
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);
  
  // Update remaining time every minute
  useEffect(() => {
    if (!timeRemaining) return;
    
    const intervalId = setInterval(() => {
      setTimeRemaining(prev => {
        if (!prev || prev <= 1) {
          clearInterval(intervalId);
          setError('This call has ended');
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [timeRemaining]);
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p>Please log in to join this call.</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <XMarkIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold mb-2">Call Unavailable</h1>
          <p className="text-gray-600 mb-6">{error || 'This call cannot be joined at this time.'}</p>
          <button
            onClick={() => router.push('/bookings')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }
  
  // Determine if user is the client or expert
  const isClient = user.id === booking.userId;
  const otherPersonName = isClient ? booking.expertName : booking.clientName;
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top bar with call info */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div>
          <h1 className="font-semibold">Call with {otherPersonName}</h1>
          <p className="text-sm text-gray-400">
            {timeRemaining 
              ? `${timeRemaining} minute${timeRemaining !== 1 ? 's' : ''} remaining` 
              : 'Call ending soon'}
          </p>
        </div>
        <button
          onClick={() => router.push('/bookings')}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md flex items-center"
        >
          <PhoneIcon className="h-4 w-4 mr-1" />
          End Call
        </button>
      </div>
      
      {/* Main call area */}
      <div className="flex-1 flex flex-col p-4">
        {/* Video grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Your video */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* This would be replaced with actual video stream */}
              <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                {user.firstName ? user.firstName[0] : ''}
                {user.lastName ? user.lastName[0] : ''}
              </div>
            </div>
            <div className="absolute bottom-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              You {!isVideoEnabled && '(Video Off)'}
            </div>
          </div>
          
          {/* Other person's video */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* This would be replaced with actual video stream */}
              <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                {otherPersonName.split(' ')[0][0]}
                {otherPersonName.split(' ')[1][0]}
              </div>
            </div>
            <div className="absolute bottom-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              {otherPersonName}
            </div>
          </div>
        </div>
        
        {/* Call controls */}
        <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-center space-x-4">
          <button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            <VideoCameraIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'}`}
          >
            <MicrophoneIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => router.push('/bookings')}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700"
          >
            <PhoneIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
