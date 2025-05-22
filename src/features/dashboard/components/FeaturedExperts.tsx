'use client';

import { SerializedExpert } from '@/types/expert';
import ExpertCard from '@/features/expert/components/ExpertCard';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface FeaturedExpertsProps {
  experts: SerializedExpert[];
}

export default function FeaturedExperts({ experts }: FeaturedExpertsProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
      <div>
          <h2 className="text-2xl font-bold text-gray-900">Featured Experts</h2>
          <p className="mt-1 text-sm text-gray-500">
          Connect with our top-rated experts in various fields
          </p>
        </div>
        <Link href="/experts" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
            View all
            <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      </div>
      {experts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No featured experts available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {experts.slice(0, 4).map((expert) => (
            <ExpertCard key={expert.id} expert={expert} showFeatured={true} />
          ))}
        </div>
      )}
    </section>
  );
}
