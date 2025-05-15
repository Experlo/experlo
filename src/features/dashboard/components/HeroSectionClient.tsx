'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/Button';

export default function HeroSectionClient() {
  const mockUser = {
    isAuthenticated: false
  };

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Connect with experts in your field
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Book one-on-one video sessions with industry experts and get the
              guidance you need to succeed.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {!mockUser.isAuthenticated && (
                <>
                  <Button
                    asChild
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <Link href="/">Get Started</Link>
                  </Button>
                  <Button
                    asChild
                    className="text-sm font-semibold leading-6 text-gray-900"
                  >
                    <Link href="/">Learn More</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="mt-8 lg:mt-0 lg:ml-8">
            <div className="relative w-[400px] h-[300px] bg-white rounded-lg shadow-lg overflow-hidden">
              <Image
                src="/images/hero-computer.png"
                alt="Video consultation preview"
                width={400}
                height={300}
                style={{ width: 'auto', height: 'auto' }}
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
