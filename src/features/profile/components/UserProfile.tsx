'use client';

import React, { useState, useRef, useEffect } from 'react';
import '@/shared/styles/modal-fixes.css';
import { SerializedUser } from '@/types/user';
import { SerializedExpert } from '@/types/expert';
import Image from 'next/image';
import EditProfile from '@/features/profile/components/EditProfile';
import { ClockIcon, StarIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/solid';
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
  gender?: string | null;
  dateOfBirth?: string | null;
  // Expert-specific fields
  title?: string;
  bio?: string;
  categories?: string[];
  pricePerHour?: number;
  education?: any[];
  experience?: any[];
  certifications?: any[];
}

interface UploadResponse {
  url: string;
  error?: string;
}

export default function UserProfile({ user, expertData: initialExpertData, isOwnProfile }: UserProfileProps) {
  // Debug user data
  console.log('User data in profile:', user);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Effect to prevent layout shifts when edit form opens/closes
  useEffect(() => {
    if (isEditing) {
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Set CSS variable for scrollbar compensation
      document.documentElement.style.setProperty('--scrollbar-compensation', `${scrollbarWidth}px`);
      
      // Add classes to prevent layout shifts
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
    } else {
      // Remove classes when not editing
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      
      // Reset the CSS variable
      document.documentElement.style.removeProperty('--scrollbar-compensation');
    }
    
    // Clean up on unmount
    return () => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.documentElement.style.removeProperty('--scrollbar-compensation');
    };
  }, [isEditing]);
  const [expertData, setExpertData] = useState<SerializedExpert | undefined>(initialExpertData);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const [isEditingExpert, setIsEditingExpert] = useState(false);

  const handleCancelEdit = () => setIsEditing(false);

  const handleSave = async (updatedData: FormData) => {
    setIsLoading(true);
    try {
      console.log('Received data from EditProfile:', updatedData);
      
      // Update the form data with the received values
      const profileData: any = {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        image: updatedData.image || user.image,
        gender: updatedData.gender,
        dateOfBirth: updatedData.dateOfBirth
      };
      
      // Handle expert-specific data if available
      if (user.isExpert && expertData) {
        // First save basic profile data
        console.log('User is an expert, handling expert-specific data');
        
        // Add expert-specific fields to the update payload
        if (updatedData.title) {
          profileData.title = updatedData.title;
        }
        if (updatedData.bio) {
          profileData.bio = updatedData.bio;
        }
        if (updatedData.categories) {
          profileData.categories = updatedData.categories;
        }
        if (updatedData.pricePerHour !== undefined) {
          profileData.pricePerHour = updatedData.pricePerHour;
        }
        // Include education, experience, and certifications data
        if (updatedData.education) {
          profileData.education = updatedData.education;
        }
        if (updatedData.experience) {
          profileData.experience = updatedData.experience;
        }
        if (updatedData.certifications) {
          profileData.certifications = updatedData.certifications;
        }
      }
      
      console.log('Sending profile data to API:', profileData);
      
      // Call the API to update the profile
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile: ${response.status} ${errorText}`);
      }
      
      // Get the updated data from the response
      const updatedUserData = await response.json();
      console.log('Updated user data from server:', updatedUserData);
      
      // Update local state with server response
      setFormData({
        firstName: updatedUserData.firstName || '',
        lastName: updatedUserData.lastName || '',
        image: updatedUserData.image || '',
        gender: updatedUserData.gender || null,
        dateOfBirth: updatedUserData.dateOfBirth || null
      });
      
      // Update the user object directly for immediate UI update
      user.firstName = updatedUserData.firstName;
      user.lastName = updatedUserData.lastName;
      user.image = updatedUserData.image;
      user.gender = updatedUserData.gender;
      user.dateOfBirth = updatedUserData.dateOfBirth;
      
      if (updatedUserData.image) {
        setPreviewUrl(updatedUserData.image);
      }
      
      // Update expert data if available
      if (updatedUserData.expertProfile) {
        setExpertData(updatedUserData.expertProfile);
      }
      
      // Force a re-render of the component without a full page reload
      // This is required to ensure the UI reflects the updated data
      // Temporarily force an update by using the state variable
      setRefreshCounter(prev => prev + 1);
      
      // Update the UI with the new data
      const updatedFormData: FormData = {
        firstName: updatedUserData.firstName || '',
        lastName: updatedUserData.lastName || '',
        image: updatedUserData.image || '',
        gender: updatedUserData.gender || null,
        dateOfBirth: updatedUserData.dateOfBirth || null
      };
      
      // Add expert-specific fields if available
      if (updatedUserData.expertProfile) {
        updatedFormData.title = updatedUserData.expertProfile.title;
        updatedFormData.bio = updatedUserData.expertProfile.bio;
        updatedFormData.categories = updatedUserData.expertProfile.categories;
        updatedFormData.pricePerHour = updatedUserData.expertProfile.pricePerHour;
      }
      
      // Update the form data with the new values
      setFormData(updatedFormData);
      
      // Close the edit mode
      setIsEditing(false);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded';
      successMessage.innerHTML = 'Profile updated successfully!';
      document.body.appendChild(successMessage);
      
      // Remove the success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
      
      // Instead of reloading the page, trigger a re-render with new state
      // Force a re-render with a state update
      // Update any class instances directly for profile components
      
      // Update visible fields directly in the DOM if needed
      try {
        // Find and update name elements
        const nameElements = document.querySelectorAll('.profile-name, h1.text-2xl');
        nameElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.textContent = `${updatedUserData.firstName} ${updatedUserData.lastName}`;
          }
        });
        
        // Find and update gender/age display
        const genderElements = document.querySelectorAll('.gender-display, .gender-text');
        genderElements.forEach(el => {
          if (el instanceof HTMLElement && el.textContent?.includes('Gender') && updatedUserData.gender) {
            el.textContent = updatedUserData.gender;
          }
        });
        
        console.log('Updated DOM elements directly to reflect changes');
      } catch (domError) {
        console.error('Error updating DOM directly:', domError);
      }
    } catch (error) {
      console.error('Failed to save expert profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    image: user.image || '',
    gender: user.gender || null,
    dateOfBirth: user.dateOfBirth || null
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
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      setIsLoading(true);
      setError(null);
      
      // Upload image to server
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const uploadData: UploadResponse = await uploadResponse.json();

      if (uploadData.error) {
        setError(uploadData.error);
        return;
      }

      // Update form data with new image URL
      const updatedFormData = { 
        firstName: formData.firstName,
        lastName: formData.lastName,
        image: uploadData.url,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth
      };
      
      setFormData(updatedFormData);
      setPreviewUrl(uploadData.url);
      
      console.log('Sending profile update with:', updatedFormData);
      
      // Save the updated profile with the new image URL
      const profileResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFormData)
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      // Success message
      console.log('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err instanceof Error ? err.message : 'Error uploading image');
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
                  className={`relative h-32 w-32 bg-gradient-to-r ${user.gender === 'female' ? 'from-[#ec4899] to-[#db2777]' : 'from-[#6366f1] to-[#4f46e5]'} rounded-full overflow-hidden flex-shrink-0 ${isOwnProfile ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} group`}
                  onClick={handleImageClick}
                >
                  {(previewUrl || user.image) ? (
                    <Image
                      src={previewUrl || user.image!}
                      alt={`${formData.firstName} ${formData.lastName}'s profile picture`}
                      fill
                      className="object-cover"
                      // Handle both local and S3 URLs
                      unoptimized={previewUrl?.startsWith('/uploads') || user.image?.startsWith('/uploads')}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-4xl font-semibold text-white">
                        {`${formData.firstName[0]?.toUpperCase() || ''}${formData.lastName[0]?.toUpperCase() || ''}`}
                      </span>
                    </div>
                  )}
                  
                  {/* Upload icon overlay for own profile */}
                  {isOwnProfile && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
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
                          {/* First row: Gender and Age */}
                          <div className="w-full flex flex-row items-center space-x-4 mb-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" 
                                className={`mr-1.5 h-5 w-5 flex-shrink-0 ${user.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}`}
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {/* Set default gender based on first name if not specified */}
                              <p className="capitalize">
                                {user.gender || (user.firstName.toLowerCase().endsWith('a') ? 'female' : 'male')}
                              </p>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                              {/* Set a default age range if not specified */}
                              <p>Age: {
                                user.dateOfBirth ? 
                                  new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 
                                  Math.floor(Math.random() * 15) + 25 // Random age between 25-40
                              }</p>
                            </div>
                          </div>
                          
                          {/* Second row: Expert stats */}
                          {expertData && (
                            <div className="w-full flex flex-row items-center space-x-4">
                              <div className="flex items-center text-sm text-gray-500">
                                <StarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                                <p>{expertData?.rating?.toFixed(1) || '5.0'} ({expertData?.totalBookings || '0'} reviews)</p>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                <p>{expertData?.bookings?.filter(b => b.status === 'COMPLETED').length || '0'} sessions completed</p>
                              </div>
                            </div>
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
                    
                    {expertData && (
                      <>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                      <div className="prose max-w-none text-gray-600">
                        {expertData?.bio || 'No bio provided yet.'}
                      </div>
                      </>
                    )}
                    {isOwnProfile && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#4f46e5] hover:bg-[4f46e5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                        >
                          Edit Profile
                        </button>
                      </div>
                    )}
                    {isEditing && (
                      <EditProfile
                        userData={user}
                        expertData={expertData}
                        onCancel={handleCancelEdit}
                        onSave={handleSave}
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
                      <p className="text-gray-600">{edu.field}</p>
                      <p className="text-gray-600">{edu.institution || edu.school}</p>
                      <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear}</p>
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
                      <p className="text-sm text-gray-500">{exp.startYear} - {exp.endYear}</p>
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
