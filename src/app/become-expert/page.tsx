'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useExpertModal } from '@/context/ExpertModalContext';

export default function BecomeExpertPage() {
  const router = useRouter();
  const { openBecomeExpertModal } = useExpertModal();
  
  useEffect(() => {
    // Show a toast notification that the user is being redirected
    toast.info('The Become an Expert form is now accessible from the header', {
      duration: 4000,
    });
    
    // Open the modal
    openBecomeExpertModal();
    
    // Redirect to home
    const redirectTimeout = setTimeout(() => {
      router.push('/');
    }, 100);
    
    return () => clearTimeout(redirectTimeout);
  }, [router, openBecomeExpertModal]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Redirecting to Home</h2>
        <p className="text-gray-600 mb-6">
          The Become an Expert form is now accessible from the header navigation.
          You will be redirected to the home page automatically.
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
