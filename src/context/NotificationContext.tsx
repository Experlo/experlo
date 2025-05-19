'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'call';
  message: string;
  link?: {
    url: string;
    text: string;
  };
  autoClose?: boolean;
  duration?: number; // in milliseconds
  meta?: {
    endTime?: string | Date; // For call notifications: when the call is scheduled to end
    bookingId?: string;    // For call notifications: the ID of the booking
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedCalls, setDismissedCalls] = useState<Set<string>>(new Set());
  const { user } = useUser();
  
  // Load dismissed calls from localStorage on initial load
  useEffect(() => {
    if (!isBrowser) return;
    
    try {
      const savedDismissedCalls = localStorage.getItem('dismissedCalls');
      if (savedDismissedCalls) {
        setDismissedCalls(new Set(JSON.parse(savedDismissedCalls)));
      }
    } catch (error) {
      console.error('Error loading dismissed calls from localStorage:', error);
    }
    // Force notifications to appear by clearing dismissed calls
    setDismissedCalls(new Set());
  }, []);

  // Function to add a notification
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // For call notifications, include the end time so we can auto-remove when call ends
    const notificationWithId = { ...notification, id };
    
    setNotifications(prev => {
      // Don't add duplicate call notifications
      if (notification.type === 'call' && notification.link?.url) {
        const existingNotificationIndex = prev.findIndex(
          n => n.type === 'call' && n.link?.url === notification.link?.url
        );
        
        if (existingNotificationIndex >= 0) {
          return prev;
        }
      }
      
      return [...prev, notificationWithId];
    });

    // Auto-close standard notifications (not calls) after a delay
    if (notification.autoClose !== false && notification.type !== 'call') {
      const duration = notification.duration || 5000; // Default 5 seconds
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    // For call notifications, set up a timer to remove when the call ends
    if (notification.type === 'call' && notification.meta?.endTime) {
      const endTime = new Date(notification.meta.endTime);
      const now = new Date();
      const timeUntilEnd = endTime.getTime() - now.getTime();
      
      if (timeUntilEnd > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, timeUntilEnd);
      }
    }
  };

  // Function to remove a notification
  const removeNotification = (id: string) => {
    // Find the notification before removing it
    const notification = notifications.find(n => n.id === id);
    
    // If it's a call notification, add its bookingId to the dismissed set
    if (notification?.type === 'call' && notification.meta?.bookingId) {
      const bookingId = notification.meta.bookingId;
      const newDismissedCalls = new Set(dismissedCalls);
      newDismissedCalls.add(bookingId);
      setDismissedCalls(newDismissedCalls);
      
      // Save to localStorage
      if (isBrowser) {
        try {
          localStorage.setItem('dismissedCalls', JSON.stringify(Array.from(newDismissedCalls)));
        } catch (error) {
          console.error('Error saving dismissed calls to localStorage:', error);
        }
      }
    }
    
    // Remove the notification
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Function to clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Check for active calls when the component mounts and periodically
  useEffect(() => {
    if (!user) return;
    
    console.log('Setting up call notification checking...');

    const checkForActiveCalls = async () => {
      console.log('Checking for active calls at:', new Date().toLocaleTimeString());
      try {
        const response = await fetch('/api/bookings');
        if (!response.ok) return;
        
        const data = await response.json();
        const now = new Date();
        
        console.log('Checking for active calls at:', now.toLocaleTimeString());
        
        // Check user bookings for any active calls
        const userBookings = data.userBookings || [];
        const expertBookings = data.expertBookings || [];
        
        // Combine all bookings
        const allBookings = [...userBookings, ...expertBookings];
        
        // Log all bookings for debugging
        console.log('All bookings:', allBookings);
        
        // Filter for active scheduled bookings
        const activeBookings = allBookings.filter(booking => {
          if (!booking.scheduledAt) return false;
          
          const startTime = new Date(booking.scheduledAt);
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
          
          // Check if the booking is currently active or within 5 minutes of starting
          const startTimeWithBuffer = new Date(startTime);
          startTimeWithBuffer.setMinutes(startTimeWithBuffer.getMinutes() - 5);
          
          // A booking is active if it's between start and end time OR 
          // if it's within 5 minutes of starting (for early notification)
          const isActive = (
            ((now >= startTimeWithBuffer && now < startTime) || // About to start (within 5 min)
             (now >= startTime && now <= endTime)) && // Currently active
            booking.status.toUpperCase() === 'SCHEDULED'
          );
          
          console.log(`Booking ${booking.id}:`, {
            scheduledTime: startTime.toLocaleTimeString(),
            endTime: endTime.toLocaleTimeString(),
            currentTime: now.toLocaleTimeString(),
            status: booking.status,
            isActive
          });
          
          return isActive;
        });
        
        console.log('Active bookings:', activeBookings);
        
        // Add notification for each active booking (if not already notified)
        activeBookings.forEach(booking => {
          const isExpertBooking = booking.role === 'expert';
          const participantName = isExpertBooking ? booking.clientName : booking.expertName;
          
          // Calculate when the call ends
          const startTime = new Date(booking.scheduledAt);
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + booking.durationMinutes);
          
          // Check if we already have this notification or if it was dismissed
          const notificationExists = notifications.some(
            n => n.type === 'call' && n.meta?.bookingId === booking.id
          );
          
          const isCallDismissed = dismissedCalls.has(booking.id);
          
          // IMPORTANT: Force notifications to appear for all active calls
          // Set dismissed calls to empty to reset any previous dismissals
          setDismissedCalls(new Set());
          
          // For debugging
          console.log('Call notification check:', {
            bookingId: booking.id,
            notificationExists,
            isCallDismissed,
            shouldShow: !notificationExists 
          });
          
          // Show notification if it doesn't already exist (ignore dismissed state)
          if (!notificationExists) {
            console.log(`Adding notification for booking ${booking.id}`);
            
            addNotification({
              type: 'call',
              message: `It's time for your call with ${participantName}!`,
              link: {
                text: 'Join Now',
                url: `/video-calls/${booking.id}`
              },
              autoClose: false, // Ensure notification doesn't auto-close
              meta: {
                bookingId: booking.id,
                endTime: endTime.toISOString()
              },
            });
          }
        });
      } catch (error) {
        console.error('Error checking for active calls:', error);
      }
    };

    // Check immediately
    checkForActiveCalls();
    
    // Then check every 10 seconds to ensure notifications appear promptly
    const interval = setInterval(checkForActiveCalls, 10000);
    
    return () => clearInterval(interval);
  }, [user, notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
