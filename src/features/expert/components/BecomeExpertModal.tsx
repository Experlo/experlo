'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BecomeExpertForm from '@/app/become-expert/BecomeExpertForm';
import { FormData } from '@/app/become-expert/BecomeExpertForm';
import { useUser } from '@/context/UserContext';
import styles from './BecomeExpertModal.module.css';
import '@/app/become-expert/BecomeExpertForm.override.css';
import './FixedFormLayout.css';
import '@/shared/styles/modal-fixes.css';

interface BecomeExpertModalProps {
  onClose: () => void;
}

export default function BecomeExpertModal({ onClose }: BecomeExpertModalProps) {
  const router = useRouter();
  const { refetchUser } = useUser();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add event listener for escape key
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Set CSS variable for scrollbar compensation
    document.documentElement.style.setProperty('--scrollbar-compensation', `${scrollbarWidth}px`);
    
    // Add classes to prevent layout shifts
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');

    return () => {
      // Clean up listeners and styles when modal closes
      document.removeEventListener('keydown', handleEscKey);
      
      // Remove classes
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      
      // Reset the CSS variable
      document.documentElement.style.removeProperty('--scrollbar-compensation');
    };
  }, [onClose]);

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
      
      // Close the modal
      onClose();
      
      // Success - redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error creating expert profile:', error);
      alert(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.backdrop} onClick={onClose} />
      <div 
        ref={modalRef}
        className={styles.formContainer}
      >
        <div className="flex justify-between items-center border-b border-gray-200 px-2 py-2 mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Become an Expert</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="h-full flex flex-col" style={{ minHeight: '550px' }}>
          <p className="text-gray-600 mb-2">Complete your expert profile to start offering your expertise on our platform.</p>
          
          <div className="flex-grow overflow-y-auto" style={{ height: 'calc(100% - 40px)' }}>
            <BecomeExpertForm 
              onSave={handleSave}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
