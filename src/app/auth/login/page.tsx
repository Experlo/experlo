'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

import { Button } from '@/shared/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { refetchUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      };

      console.log('Sending login request with data:', data);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include' // Important: include credentials for cookie handling
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', Object.fromEntries(response.headers));
      
      const result = await response.json();
      console.log('Login response data:', result);

      if (!response.ok) {
        console.error('Login failed:', result.error);
        setError(result.error || 'An error occurred during login');
        return;
      }

      console.log('Login successful, updating user data...');
      
      // Fetch user data first
      await refetchUser();
      
      console.log('User data updated, redirecting...');
      
      // Force a full page reload to ensure clean state
      const baseUrl = window.location.origin;
      window.location.href = `${baseUrl}/dashboard`;
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
            Connect with experts and AI assistants for personalized learning and consultations.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#5D5FEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700">Schedule sessions at your convenience</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#5D5FEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-700">High-quality video consultations</p>
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
                Connect with experts and AI assistants
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
                  autoComplete="current-password"
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
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="font-medium text-[#5D5FEF] hover:text-[#4A4CC0]">
                  Forgot your password?
                </Link>
                <Link href="/auth/signup" className="font-medium text-[#5D5FEF] hover:text-[#4A4CC0]">
                  Create account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}