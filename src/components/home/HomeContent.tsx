'use client';

import { useEffect, useState } from 'react';
import FeaturedExperts from '@/features/home/components/FeaturedExperts';
import AIExperts from '@/features/home/components/AIExperts';
import HowItWorks from '@/features/home/components/HowItWorks';
import HeroSection from '@/features/home/components/HeroSection';
import UpcomingBookingsSection from '@/features/home/components/UpcomingBookingsSection';
import Header from '@/shared/components/ui/Header';
import type { SerializedExpert } from '@/types/expert';

export function HomeContent() {
  const [experts, setExperts] = useState<SerializedExpert[]>([]);
  const [expertsLoading, setExpertsLoading] = useState(true);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await fetch('/api/experts/featured');
        if (response.ok) {
          const data = await response.json();
          setExperts(data);
        }
      } catch (error) {
        console.error('Error fetching experts:', error);
      } finally {
        setExpertsLoading(false);
      }
    };

    fetchExperts();
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 pt-16">
        {/* Hero Section */}
        <HeroSection />
        
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Upcoming Bookings Section */}
            <UpcomingBookingsSection />
            
            {/* Featured Experts */}
            {expertsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
                  ))}
                </div>
              </div>
            ) : (
              <FeaturedExperts experts={experts} />
            )}

            {/* AI Experts on Demand */}
            <AIExperts />

            {/* How It Works */}
            <HowItWorks />
          </div>
        </div>
      </div>
    </>
  );
}
