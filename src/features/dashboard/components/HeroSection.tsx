'use client';

import Image from 'next/image';
import Link from 'next/link';
import AIAdvisorButton from './AIAdvisorButton';

export default function HeroSection() {
  // Mock user data
  const mockUser = {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe'
  };

  return (
    <div className="bg-indigo-600 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Expert advice, one minute at a time
            </h1>
            <p className="mt-4 text-lg">
              Book minute-by-minute video consultations with professionals, celebrities, and AI experts—all in one platform.
            </p>
            <div className="mt-8 flex gap-4">
              <a
                href="/experts"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
              >
                Browse Experts
              </a>
              <AIAdvisorButton />
            </div>
          </div>
          <div className="mt-8 lg:mt-0 lg:ml-8">
            <div className="relative w-[400px] h-[300px] bg-white rounded-lg shadow-lg overflow-hidden">
              <Image
                src="/images/hero-computer.png"
                alt="Video consultation preview"
                fill
                sizes="(max-width: 400px) 100vw, 400px"
                style={{ objectFit: 'cover' }}
                priority
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
