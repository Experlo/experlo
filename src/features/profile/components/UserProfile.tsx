'use client';

import React, { useState, useRef } from 'react';
import { SerializedUser } from '@/types/user';
import { SerializedExpert } from '@/types/expert';
import Image from 'next/image';
import EditExpertProfile from './EditExpertProfile';
import { ClockIcon, StarIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import Header from '@/shared/components/ui/Header';
import { Button } from '@/shared/components/ui/Button';
import Link from 'next/link';

interface UserProfileProps {
  user: SerializedUser;
  expertData?: SerializedExpert;
  isOwnProfile: boolean;
  error?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  image: string;
}

interface UploadResponse {
  url: string;
  error?: string;
}

export default function UserProfile({ user, expertData: initialExpertData, isOwnProfile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expertData, setExpertData] = useState<SerializedExpert | undefined>(initialExpertData);

  const [isEditingExpert, setIsEditingExpert] = useState(false);

  const handleCancelEdit = () => setIsEditing(false);

  const handleSaveExpert = async (formData: FormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement save logic
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save expert profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    image: user.image || ''
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.image || null);

  const handleImageClick = () => {
    if (isOwnProfile && !isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsLoading(true);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data: UploadResponse = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setFormData(prev => ({ ...prev, image: data.url }));
      setPreviewUrl(data.url);
    } catch (err) {
      setError('Error uploading image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setIsEditing(false);
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="space-y-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="relative bg-gray-50 shadow-sm rounded-2xl overflow-hidden">
          {expertData && (
            <div className="absolute top-4 right-4 bg-[#4f46e5] text-white px-3 py-1.5 rounded-full text-sm font-medium">
              ${expertData.pricePerHour}/hr
            </div>
          )}
          <div className="p-8">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <div 
                  className={`h-32 w-32 bg-[#4f46e5] rounded-lg overflow-hidden flex-shrink-0 ${isOwnProfile ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                  onClick={handleImageClick}
                >
                  {(previewUrl || user.image) ? (
                    <Image
                      src={previewUrl || user.image!}
                      alt={`${formData.firstName} ${formData.lastName}'s profile picture`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-4xl font-semibold text-white">
                        {`${formData.firstName[0]?.toUpperCase() || ''}${formData.lastName[0]?.toUpperCase() || ''}`}
                      </span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex space-x-4">
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="First name"
                          />
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Last name"
                          />
                        </div>
                        <div className="flex space-x-4">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmit}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={isLoading}
                          >
                            {isLoading ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-3">
                          <h1 className="text-2xl font-semibold text-gray-900">
                            {`${formData.firstName} ${formData.lastName}`}
                          </h1>
                          {user.isExpert && (
                            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                              Expert
                            </span>
                          )}
                        </div>
                        {expertData?.title && (
                          <p className="text-lg text-gray-600 mt-1.5">{expertData.title}</p>
                        )}
                        <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-8">
                          {expertData && (
                            <>
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <StarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                                <p>{expertData.rating?.toFixed(1) || '5.0'} ({expertData.totalBookings || '0'} reviews)</p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                <p>{expertData.bookings?.filter(b => b.status === 'COMPLETED').length || '0'} sessions completed</p>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2">
                        {expertData?.categories?.map((category, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm font-medium text-[#4f46e5] bg-indigo-50 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* About section */}
                <div className="mt-8 flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                    <div className="prose max-w-none text-gray-600">
                      {expertData?.bio || 'No bio provided yet.'}
                    </div>
                    {isOwnProfile && expertData && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#4f46e5] hover:bg-[4f46e5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                        >
                          Edit Profile
                        </button>
                      </div>
                    )}
                    {isEditing && expertData && (
                      <EditExpertProfile
                        userData={user}
                        expertData={expertData}
                        onCancel={handleCancelEdit}
                        onSave={handleSaveExpert}
                        isLoading={isLoading}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Booking */}
        {!isOwnProfile && expertData && (
          <div className="mt-8">
            <div className="bg-gray-50 shadow-sm rounded-2xl p-8 sticky top-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Book a Session</h3>
                  <p className="text-sm text-gray-500">Schedule a one-on-one consultation</p>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-gray-100">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">60-minute session</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">${expertData.pricePerHour}</span>
                </div>

                <button
                  className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-md font-medium"
                >
                  Book Now
                </button>

                <div className="text-sm text-gray-500 text-center">
                  <p>Free cancellation up to 24 hours before your session</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professional Info - Only visible for experts */}
        {expertData && (
          <div className="bg-gray-50 shadow-sm rounded-2xl p-8 mt-8">
            {expertData.education && expertData.education.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
                <div className="space-y-4">
                  {expertData.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-indigo-200 pl-4">
                      <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.endYear}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expertData.experience && expertData.experience.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience</h2>
                <div className="space-y-4">
                  {expertData.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-indigo-200 pl-4">
                      <h3 className="font-medium text-gray-900">{exp.position}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.endYear}</p>
                      <p className="text-gray-600 mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {expertData.certifications && expertData.certifications.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
                <div className="space-y-4">
                  {expertData.certifications.map((cert, index) => (
                    <div key={index} className="border-l-2 border-indigo-200 pl-4">
                      <h3 className="font-medium text-gray-900">{cert.name}</h3>
                      <p className="text-gray-600">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">{cert.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit button moved next to About section */}
        </div>
      </div>
    </div>
  );
}
