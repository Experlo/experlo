'use client';

import { useRouter } from 'next/navigation';
import BecomeExpertForm from './BecomeExpertForm';
import { FormData } from './BecomeExpertForm';
import { useUser } from '@/context/UserContext';

export default function BecomeExpertPage() {
  const router = useRouter();
  const { refetchUser } = useUser();

  const handleSave = async (formData: FormData) => {
    try {
      // Validate form data before sending
      if (!formData.title || !formData.bio || formData.categories.length === 0 || !formData.pricePerHour) {
        throw new Error('Please fill in all required fields: Title, Bio, Categories, and Hourly Rate');
      }

      const response = await fetch('/api/experts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { error: 'Received non-JSON response from server' };
      }
      
      if (!response.ok) {
        console.error('Server response:', data);
        throw new Error(`Failed to create expert profile: ${data.error || response.statusText}`);
      }

      // Refresh user data to update isExpert status
      await refetchUser();
      
      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating expert profile:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 bg-white border-b border-gray-200">
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
