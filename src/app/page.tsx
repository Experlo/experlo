'use client';

import { Metadata } from 'next';
import { useUser } from '@/context/UserContext';
import { LandingPage } from '@/components/landing/LandingPage';
import { HomeContent } from '@/components/home/HomeContent';

// Metadata must be in a server component (layout.tsx)
// This page is a client component to handle authentication



export default function Home() {
  const { user, loading } = useUser();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  // If the user is authenticated, show the home page
  // Otherwise, show the landing page
  return user ? <HomeContent /> : <LandingPage />;
}
