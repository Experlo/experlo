'use client';

import { useRouter } from 'next/navigation';
import BecomeExpertForm from './BecomeExpertForm';
import { FormData } from './BecomeExpertForm';

export default function BecomeExpertPage() {
  const router = useRouter();

  const handleSave = async (formData: FormData) => {
    try {
      const response = await fetch('/api/experts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create expert profile');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating expert profile:', error);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 bg-white border-b border-gray-200">
            <h1 className="text-3xl font-bold mb-8">Become an Expert</h1>
            <p className="text-gray-600 mb-8">
              Share your expertise and help others succeed. Complete the form below to get started.
            </p>
            <BecomeExpertForm 
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
