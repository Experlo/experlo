'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { CalendarIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
  gender?: string;
  dateOfBirth?: string;
  isExpert: boolean;
}

export default function UserProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real implementation, fetch user data from your API
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load user profile');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Could not load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          {error || 'User not found'}
        </div>
      </div>
    );
  }

  // Format date of birth if it exists
  const formattedDateOfBirth = user.dateOfBirth 
    ? new Date(user.dateOfBirth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  // Calculate age if date of birth exists
  const age = user.dateOfBirth 
    ? Math.floor((new Date().getTime() - new Date(user.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32"></div>
        
        <div className="p-6 sm:p-8 -mt-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-start">
            {/* Profile Image */}
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow mb-4 sm:mb-0 sm:mr-6 bg-white">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={`${user.firstName} ${user.lastName}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <span className="text-3xl font-bold text-gray-700">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-1" />
                  <span>{user.email}</span>
                </div>
                
                {user.gender && (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="capitalize">{user.gender}</span>
                  </div>
                )}
                
                {formattedDateOfBirth && age && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-1" />
                    <span>Age: {age}</span>
                  </div>
                )}
              </div>
              
              {user.isExpert && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Expert
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add more sections as needed - like past interactions, etc. */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
        <p className="text-gray-600">
          This is where you can view your shared booking history with this user.
          <br />
          To see all bookings, please visit the <a href="/bookings" className="text-indigo-600 hover:text-indigo-800 hover:underline">Bookings page</a>.
        </p>
      </div>
    </div>
  );
}
