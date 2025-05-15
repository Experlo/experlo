'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/Button';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      // Redirect to login page after successful registration
      router.push('/auth/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left side with logo and tagline */}
        <div className="flex-1 pr-12 hidden lg:flex flex-col justify-center">
          <h1 className="text-6xl font-bold text-[#5D5FEF] mb-6">
            experlo
          </h1>
          <p className="text-2xl text-gray-700 leading-relaxed max-w-xl">
            Join our community of experts and AI assistants to share knowledge and empower others.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#5D5FEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-700">Join our growing expert community</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#5D5FEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700">Set your own rates and schedule</p>
            </div>
          </div>
        </div>

        {/* Right side with form */}
        <div className="w-full max-w-md">
          <div className="bg-white shadow-2xl rounded-2xl p-8">
            <div className="lg:hidden mb-8">
              <h1 className="text-4xl font-bold text-[#5D5FEF] text-center mb-2">
                experlo
              </h1>
              <p className="text-gray-700 text-center">
                Join our community of experts and AI assistants
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    placeholder="First name"
                    autoComplete="given-name"
                    required
                    className="block w-full px-4 py-3 rounded-xl border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-[#5D5FEF] focus:border-[#5D5FEF] text-base"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    placeholder="Last name"
                    autoComplete="family-name"
                    required
                    className="block w-full px-4 py-3 rounded-xl border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-[#5D5FEF] focus:border-[#5D5FEF] text-base"
                  />
                </div>
              </div>

              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  autoComplete="email"
                  required
                  className="block w-full px-4 py-3 rounded-xl border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-[#5D5FEF] focus:border-[#5D5FEF] text-base"
                />
              </div>

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  required
                  className="block w-full px-4 py-3 rounded-xl border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-[#5D5FEF] focus:border-[#5D5FEF] text-base"
                />
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 text-lg font-medium rounded-xl text-white bg-[#5D5FEF] hover:bg-[#4A4CC0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5D5FEF]"
                >
                  {isLoading ? 'Creating account...' : 'Create your account'}
                </Button>
              </div>

              <div className="text-center text-sm">
                <Link href="/auth/login" className="font-medium text-[#5D5FEF] hover:text-[#4A4CC0]">
                  Already have an account? Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
