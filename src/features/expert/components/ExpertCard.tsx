'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { SerializedExpert } from '@/types/expert';
import { SerializedUser } from '@/types/user';

interface ExpertCardProps {
  expert: SerializedExpert;
  showFeatured?: boolean;
}

export default function ExpertCard({ expert }: ExpertCardProps) {
  const {
    id,
    user: { firstName, lastName, image, gender },
    title,
    pricePerHour,
    rating,
    totalBookings,
    categories,
  } = expert;

  return (
    <Link href={`/experts/${id}`} className="block group h-full">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        {/* Profile section with colored background - fixed height */}
        <div className={`bg-indigo-50 p-6 min-h-[160px] flex flex-col`}>
          <div className="flex justify-between items-start">
            {/* Profile Image */}
            {image ? (
              <div className="relative h-20 w-20 rounded-full overflow-hidden shadow-md">
                <Image
                  src={image}
                  alt={`${firstName} ${lastName}`}
                  fill
                  className="object-cover"
                  // Handle both local and S3 URLs
                  unoptimized={image.startsWith('/uploads')}
                />
              </div>
            ) : (
              <div className={`h-12 w-12 rounded-full overflow-hidden shadow-md flex items-center justify-center ${gender?.toLowerCase() === 'female' ? 'bg-gradient-to-br from-[#ec4899] to-[#db2777]' : 'bg-gradient-to-br from-[#6366f1] to-[#4f46e5]'}`}>
                <span className="text-lg font-semibold text-white">
                  {`${firstName[0]}${lastName[0]}`}
                </span>
              </div>
            )}
            
            {/* Price tag */}
            <div className="bg-[#4f46e5] text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
              ${pricePerHour}/hr
            </div>
          </div>
          
          {/* Name and title */}
          <div className="mt-4 flex-grow flex flex-col justify-end">
            <h3 className="font-semibold text-gray-900">{`${firstName} ${lastName}`}</h3>
            <p className="text-sm text-gray-500 mt-1">{title}</p>
          </div>
        </div>

        {/* Description/tags section with fixed height */}
        <div className="p-6 flex flex-col justify-between flex-grow">
          {/* Top part with categories */}
          <div>
            <div className="flex flex-wrap gap-1 mb-4">
              {categories.slice(0, 3).map((category, index) => {
                return (
                  <span
                    key={index}
                    className="text-xs font-medium text-[#4f46e5] bg-indigo-50 rounded-full px-2 py-0.5"
                  >
                    {category}
                  </span>
                );
              })}
              {categories.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{categories.length - 3}
                </span>
              )}
            </div>
          </div>
          
          {/* Bottom part with rating and button - always at the bottom */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-700 ml-1 font-medium">{rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500 ml-1">({totalBookings})</span>
            </div>
            <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
