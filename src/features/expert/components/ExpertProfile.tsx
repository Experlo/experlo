'use client';

import { CalendarIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import type { Experience, Education, Certification } from '@/types/schema';
import type { SerializedExpert } from '@/types/expert';

interface ExpertProfileProps {
  expert: SerializedExpert;
}

export default function ExpertProfile({ expert }: ExpertProfileProps) {
  const {
    user: { firstName, lastName, image },
    title,
    bio,
    categories,
    pricePerHour,
    education,
    experience,
    certifications,
    totalBookings,
    rating = 5,
  } = expert;

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Info */}
              <div className="relative bg-gray-50 shadow-sm rounded-2xl overflow-hidden h-full">
                <div className="absolute top-4 right-4 bg-[#4f46e5] text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                  ${pricePerHour}/hr
                </div>
                <div className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="relative h-40 w-40 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                      {image ? (
                        <Image
                          src={image}
                          alt={`${firstName} ${lastName}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center">
                          <span className="text-3xl font-semibold text-white">
                            {`${firstName[0]}${lastName[0]}`}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">{`${firstName} ${lastName}`}</h1>
                          <p className="text-xl text-gray-600 mb-4">{title}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center text-yellow-500">
                              <StarIcon className="h-5 w-5" />
                              <span className="ml-1 font-medium">{rating.toFixed(1)}</span>
                              <span className="text-gray-500 ml-1">({totalBookings} reviews)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-2">
                        {categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm font-medium text-[#4f46e5] bg-indigo-50 rounded-full"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
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
                  >
                    Book Now
                  </button>

                  <div className="text-sm text-gray-500 text-center">
                    <p>Free cancellation up to 24 hours before your session</p>
                  </div>
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
                    <div className="text-gray-600">{edu.school}</div>
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
