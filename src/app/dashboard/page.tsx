'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import FeaturedExperts from '@/features/dashboard/components/FeaturedExperts';
import AIExperts from '@/features/dashboard/components/AIExperts';
import HowItWorks from '@/features/dashboard/components/HowItWorks';
import HeroSection from '@/features/dashboard/components/HeroSection';
import UpcomingBookingsSection from '@/features/dashboard/components/UpcomingBookingsSection';
import type { SerializedExpert } from '@/types/expert';

export default function DashboardPage() {
  const { user, loading } = useUser();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Let middleware handle the redirect if no user
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
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
  );
}
