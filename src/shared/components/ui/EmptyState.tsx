import React from 'react';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg p-8 text-center shadow-sm">
      {icon && <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
        {icon}
      </div>}
      <h3 className="text-lg font-medium text-gray-900">No items to display</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
    </div>
  );
}
