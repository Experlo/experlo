'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import BecomeExpertModal from '@/features/expert/components/BecomeExpertModal';

interface ExpertModalContextType {
  openBecomeExpertModal: () => void;
  closeBecomeExpertModal: () => void;
}

const ExpertModalContext = createContext<ExpertModalContextType>({
  openBecomeExpertModal: () => {},
  closeBecomeExpertModal: () => {},
});

export const useExpertModal = () => useContext(ExpertModalContext);

export function ExpertModalProvider({ children }: { children: ReactNode }) {
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);

  const openBecomeExpertModal = () => {
    setIsExpertModalOpen(true);
  };

  const closeBecomeExpertModal = () => {
    setIsExpertModalOpen(false);
  };

  return (
    <ExpertModalContext.Provider value={{ openBecomeExpertModal, closeBecomeExpertModal }}>
      {children}
      {isExpertModalOpen && <BecomeExpertModal onClose={closeBecomeExpertModal} />}
    </ExpertModalContext.Provider>
  );
}
