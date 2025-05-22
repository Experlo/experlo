'use client';

import { useState } from 'react';
import { CalendarIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import type { Experience, Education, Certification } from '@/types/schema';
import type { SerializedExpert } from '@/types/expert';
import BookingModal from '@/features/booking/components/BookingModal';
import UserExpertBookings from '@/features/booking/components/UserExpertBookings';

interface ExpertProfileProps {
  expert: SerializedExpert;
}

export default function ExpertProfile({ expert }: ExpertProfileProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  // Debug expert data
  console.log('Expert data in profile:', expert);
  console.log('User data in expert profile:', expert.user);
  console.log('Raw gender value:', expert.user.gender);
  
  // Normalize gender before destructuring
  if (expert.user.gender) {
    expert.user.gender = expert.user.gender.toLowerCase().trim();
    console.log('Normalized gender before destructuring:', expert.user.gender);
  }
  
  const {
    user: { firstName, lastName, image, gender, dateOfBirth },
    title,
    bio,
    categories,
    pricePerHour,
    education,
    experience,
    certifications,
    totalBookings,
    rating = 5,
    bookings = [],
  } = expert;
  
  // Force gender to be a specific value for debugging
  const effectiveGender = gender?.toLowerCase().trim() || null;
  console.log('Effective gender value:', effectiveGender);
  
  // Debug gender and dateOfBirth after destructuring
  console.log('Gender after destructuring:', gender, typeof gender);
  console.log('Is gender null or undefined?', gender === null || gender === undefined);
  console.log('Is gender empty string?', gender === '');
  console.log('Date of Birth:', dateOfBirth, typeof dateOfBirth);

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Info */}
              <div className="relative bg-gray-50 shadow-sm rounded-2xl overflow-hidden h-full">
                <div className="absolute top-3 right-3 bg-[#4f46e5] text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                  ${pricePerHour}/hr
                </div>
                <div className="py-3 px-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative h-24 w-24 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                      {image ? (
                        <Image
                          src={image}
                          alt={`${firstName} ${lastName}`}
                          fill
                          className="object-cover"
                          // Handle both local and S3 URLs
                          unoptimized={image.startsWith('/uploads')}
                        />
                      ) : (
                        <div className={`h-full w-full rounded-full bg-gradient-to-br ${effectiveGender === 'female' ? 'from-[#ec4899] to-[#db2777]' : 'from-[#6366f1] to-[#4f46e5]'} flex items-center justify-center`}>
                          <span className="text-3xl font-semibold text-white">
                            {`${firstName[0]}${lastName[0]}`}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h1 className="text-2xl font-bold text-gray-900 mb-1">{`${firstName} ${lastName}`}</h1>
                          <p className="text-lg text-gray-600 mb-2">{title}</p>
                          {/* Gender and Age Row */}
                          <div className="flex items-center space-x-4 text-sm mb-1">
                            <div className="flex items-center text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" 
                                className={`mr-1.5 h-5 w-5 flex-shrink-0 ${effectiveGender === 'female' ? 'text-pink-500' : 'text-blue-500'}`} 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="capitalize">
                                {effectiveGender || 'Not specified'}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {/* Only show age if dateOfBirth is specified */}
                              <span>
                                {dateOfBirth ? 
                                  `Age: ${new Date().getFullYear() - new Date(dateOfBirth).getFullYear()}` : 
                                  'Age: Not specified'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Reviews and Sessions Row */}
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="flex items-center text-yellow-500">
                              <StarIcon className="h-4 w-4" />
                              <span className="ml-1 font-medium">{rating.toFixed(1)}</span>
                              <span className="text-gray-500 ml-1">({totalBookings} reviews)</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              <span>{bookings?.filter(b => b.status === 'COMPLETED').length || 0} sessions completed</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs font-medium text-[#4f46e5] bg-indigo-50 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">About</h2>
                    <p className="text-gray-600 whitespace-pre-line">{bio}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking */}
            <div>
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
                    <span className="text-lg font-semibold text-gray-900">${pricePerHour}</span>
                  </div>

                  <button
                    className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-md font-medium"
                    onClick={() => setIsBookingModalOpen(true)}
                  >
                    Book Now
                  </button>
                  
                  {/* Booking Modal */}
                  <BookingModal
                    expert={expert}
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                  />

                  <div className="text-sm text-gray-500 text-center">
                    <p>Free cancellation up to 24 hours before your session</p>
                  </div>
                  
                  {/* Show user's bookings with this expert */}
                  <UserExpertBookings expertId={expert.id} />
                </div>
              </div>
            </div>
          </div>

          {/* Experience, Education, Certifications - Full Width */}
          <div className="bg-gray-50 shadow-sm rounded-2xl p-8">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience</h2>
              <div className="space-y-6">
                {experience?.map((exp, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <div className="text-sm text-gray-500">
                      {exp.startYear} - {exp.endYear || 'Present'}
                    </div>
                    <div className="font-medium text-gray-900">{exp.position}</div>
                    <div className="text-gray-600">{exp.company}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
              <div className="space-y-6">
                {education?.map((edu, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <div className="text-sm text-gray-500">
                      {edu.startYear} - {edu.endYear}
                    </div>
                    <div className="font-medium text-gray-900">{edu.degree}</div>
                    <div className="text-gray-600">{edu.institution}</div>
                    <div className="text-gray-600">{edu.field}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h2>
              <div className="space-y-6">
                {certifications?.map((cert, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <div className="text-sm text-gray-500">{cert.year}</div>
                    <div className="font-medium text-gray-900">{cert.name}</div>
                    <div className="text-gray-600">{cert.issuer}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
