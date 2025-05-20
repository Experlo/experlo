'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  XMarkIcon, 
  InformationCircleIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  VideoCameraIcon 
} from '@heroicons/react/24/outline';
import { useNotification, Notification } from '@/context/NotificationContext';
import Link from 'next/link';

export default function Notifications() {
  const { notifications, removeNotification } = useNotification();
  const [isVisible, setIsVisible] = useState<{[key: string]: boolean}>({});
  const pathname = usePathname();

  // Set up animation states when notifications change
  useEffect(() => {
    // Make new notifications visible with animation
    notifications.forEach(notification => {
      if (isVisible[notification.id] === undefined) {
        // Start hidden
        setIsVisible(prev => ({ ...prev, [notification.id]: false }));
        
        // Then animate in after a short delay (for the transition to work)
        setTimeout(() => {
          setIsVisible(prev => ({ ...prev, [notification.id]: true }));
          console.log(`Showing notification ${notification.id}:`, notification.message);
        }, 50);
      }
    });
    
    // Log current notifications for debugging
    if (notifications.length > 0) {
      console.log('Active notifications:', notifications.length, 
        notifications.map(n => ({ id: n.id, type: n.type, message: n.message })));
    }
  }, [notifications, isVisible]);

  const handleClose = (id: string) => {
    // Animate out
    setIsVisible(prev => ({ ...prev, [id]: false }));
    
    // Remove after animation completes
    setTimeout(() => {
      removeNotification(id);
    }, 300); // Match this with the CSS transition duration
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'call':
        return <VideoCameraIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'call':
        return 'bg-green-100 border-green-300 shadow-lg';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  // Function to format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter out call notifications when user is already on the video call page for that booking
  const filteredNotifications = notifications.filter(notification => {
    // If it's not a call notification, always show it
    if (notification.type !== 'call') return true;
    
    // If it's a call notification, check if we're already on the video call page
    const bookingId = notification.meta?.bookingId;
    
    // Don't show notification if user is already on any video call page
    if (pathname.startsWith('/video-calls/')) {
      // If we have a specific bookingId, only hide for that specific call page
      if (bookingId) {
        return pathname !== `/video-calls/${bookingId}`;
      }
      // If somehow we don't have a bookingId, hide on all call pages
      return false;
    }
    
    return true;
  });

  if (filteredNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 right-0 z-50 p-4 max-w-md w-full flex flex-col items-end space-y-3">
      {filteredNotifications.map(notification => {
        const isCallNotification = notification.type === 'call';
        const endTime = isCallNotification && notification.meta?.endTime 
          ? new Date(notification.meta.endTime) 
          : null;
        
        return (
          <div
            key={notification.id}
            className={`${getNotificationStyles(notification.type)} border rounded-lg shadow-md py-3 px-4 w-full 
              ${isCallNotification ? 'max-w-sm' : 'max-w-xs'}
              transform transition-all duration-300 ${isVisible[notification.id] 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-8 opacity-0'
              }
            `}
          >
            <div className="flex items-start gap-2">
              <div className={`flex-shrink-0 ${isCallNotification ? 'mt-1' : ''}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 ml-2">
                {/* Different styling for call notifications */}
                {isCallNotification ? (
                  <>
                    <p className="text-sm font-semibold text-gray-900">{notification.message}</p>
                    {endTime && (
                      <p className="text-xs text-gray-600 mt-1">
                        Call ends at {formatTime(endTime)}
                      </p>
                    )}
                    {notification.link && (
                      <Link
                        href={notification.link.url}
                        className="mt-2 inline-block px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                        onClick={() => handleClose(notification.id)}
                      >
                        {notification.link.text}
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    {notification.link && (
                      <Link
                        href={notification.link.url}
                        className="mt-1 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        target={undefined}
                      >
                        {notification.link.text}
                      </Link>
                    )}
                  </>
                )}
              </div>
              <button
                className="flex-shrink-0 ml-1 text-gray-400 hover:text-gray-500"
                onClick={() => handleClose(notification.id)}
                aria-label="Dismiss notification"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
