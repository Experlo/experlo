'use client';

import Link from 'next/link';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { SerializedExpert } from '@/types/expert';

interface ExpertCardProps {
  expert: SerializedExpert;
  showFeatured?: boolean;
}

export default function ExpertCard({ expert }: ExpertCardProps) {
  const {
    id,
    user: { firstName, lastName, image },
    title,
    pricePerHour,
    rating,
    totalBookings,
    categories,
  } = expert;

  return (
    <Link href={`/experts/${id}`} className="block group h-full">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        {/* Expert Image */}
        <div className="relative h-60 w-full bg-gradient-to-r from-[#6366f1] to-[#4f46e5]">
          {image ? (
            <Image
              src={image}
              alt={`${firstName} ${lastName}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-4xl font-semibold text-white">
                {`${firstName[0]}${lastName[0]}`}
              </span>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-[#4f46e5] text-white px-3 py-1 rounded-full text-sm font-medium">
            ${pricePerHour}/hr
          </div>
        </div>

        {/* Expert Info */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex flex-col space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{`${firstName} ${lastName}`}</h3>
                <p className="text-sm text-gray-600">{title}</p>
              </div>
              <div className="flex items-center space-x-1">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({totalBookings})</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 3).map((category, index) => {
                return (
                  <span
                    key={index}
                    className="text-sm font-medium text-[#4f46e5] bg-indigo-50 rounded-full px-3 py-1"
                  >
                    {category}
                  </span>
                );
              })}
              {categories.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{categories.length - 3} more
                </span>
              )}
            </div>
          </div>

          <button className="mt-auto w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200">
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
}
