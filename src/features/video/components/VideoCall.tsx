'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Define types without importing the SDK directly
type IAgoraRTCClient = any;
type IAgoraRTCRemoteUser = any;
type ILocalAudioTrack = any;
type ILocalVideoTrack = any;
type ICameraVideoTrack = any;
type IMicrophoneAudioTrack = any;
type UID = string | number;

// Dynamic import for Agora SDK (client-side only)
let AgoraRTC: any = null;
import {
  MicrophoneIcon,
  VideoCameraIcon,
  PhoneIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

interface VideoCallProps {
  bookingId: string;
  userId: string;
  userName: string;
  otherPersonName: string;
  isExpert: boolean;
  onCallEnd?: () => void;
  duration?: number; // in minutes
}

interface DeviceInfo {
  audio: MediaDeviceInfo[];
  video: MediaDeviceInfo[];
}

interface CallTimerProps {
  duration: number; // in minutes
  startTime: Date;
  onTimeUp?: () => void;
}

const CallTimer = ({ duration, startTime, onTimeUp }: CallTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  useEffect(() => {
    // Convert duration from minutes to milliseconds
    const durationMs = duration * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);
    
    const calculateRemaining = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining <= 0 && onTimeUp) {
        onTimeUp();
      }
    };
    
    calculateRemaining();
    const timer = setInterval(calculateRemaining, 1000);
    
    return () => clearInterval(timer);
  }, [duration, startTime, onTimeUp]);
  
  if (timeRemaining === null) return null;
  
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  return (
    <div className="bg-gray-800/70 px-3 py-2 rounded-full text-white">
      <span className="font-medium">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
};

export default function VideoCall({
  bookingId,
  userId,
  userName,
  otherPersonName,
  isExpert,
  onCallEnd,
  duration = 60 // default to 60 minutes if not specified
}: VideoCallProps) {
  // State variables
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [availableDevices, setAvailableDevices] = useState<DeviceInfo>({ audio: [], video: [] });
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [networkQuality, setNetworkQuality] = useState<number>(5); // 0-5, 5 being excellent
  const [sdkReady, setSdkReady] = useState(false); // Track if Agora SDK is loaded

  // References
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localTracksRef = useRef<{
    videoTrack: ILocalVideoTrack | null;
    audioTrack: ILocalAudioTrack | null;
    screenTrack: ILocalVideoTrack | null;
  }>({
    videoTrack: null,
    audioTrack: null,
    screenTrack: null
  });
  const localVideoRef = useRef<HTMLDivElement>(null);
  
  // Dynamically import Agora SDK on client-side only
  useEffect(() => {
    const loadAgoraSDK = async () => {
      try {
        // Import the SDK dynamically
        const AgoraRTCModule = await import('agora-rtc-sdk-ng');
        AgoraRTC = AgoraRTCModule.default;
        setSdkReady(true);
        console.log('Agora SDK loaded successfully');
      } catch (err) {
        console.error('Failed to load Agora SDK:', err);
        setError('Failed to load video call technology. Please try again or contact support.');
      }
    };
    
    loadAgoraSDK();
  }, []);

  // Track call join time for the database
  useEffect(() => {
    if (isJoined) {
      // Record user joining the call
      trackCallEvent('join');
    }
    
    return () => {
      if (isJoined) {
        // Record user leaving the call when component unmounts
        trackCallEvent('leave');
      }
    };
  }, [isJoined, bookingId, userId]);
  
  // Track call events (join, leave)
  const trackCallEvent = async (event: 'join' | 'leave') => {
    try {
      const response = await fetch('/api/video/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          userId,
          event,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            networkQuality
          }
        })
      });
      
      if (!response.ok) {
        console.error('Failed to track call event:', event);
      }
    } catch (error) {
      console.error('Error tracking call event:', error);
    }
  };
  
  // Initialize Agora client
  const initializeAgora = useCallback(async () => {
    if (!sdkReady) {
      setError('Video call technology is still loading. Please wait...');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create an Agora client
      console.log('[DEBUG] Creating Agora client...');
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;
      
      // Get available devices
      const audioDevices = await AgoraRTC.getMicrophones();
      const videoDevices = await AgoraRTC.getCameras();
      setAvailableDevices({ audio: audioDevices, video: videoDevices });
      
      // Setup event handlers
      client.on('user-published', handleUserPublished);
      client.on('user-unpublished', handleUserUnpublished);
      client.on('user-left', handleUserLeft);
      client.on('network-quality', handleNetworkQuality);
      
      // Get token from backend
      console.log('[DEBUG] Requesting token for booking:', bookingId);
      const response = await fetch('/api/video/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      
      console.log('[DEBUG] Token API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEBUG] Token API error:', errorText);
        throw new Error(`Failed to get token: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('[DEBUG] Token API response data:', responseData);
      
      const { token, channelName, uid } = responseData;
      
      // Join the channel
      console.log('[DEBUG] Joining channel with:', {
        appId: process.env.NEXT_PUBLIC_AGORA_APP_ID ? process.env.NEXT_PUBLIC_AGORA_APP_ID.substring(0, 4) + '...' : 'NOT SET',
        channelName,
        tokenPresent: !!token,
        uid
      });
      
      await client.join(process.env.NEXT_PUBLIC_AGORA_APP_ID || '', channelName, token, uid);
      console.log('[DEBUG] Joined channel successfully:', channelName);
      
      // Create local tracks
      console.log('[DEBUG] Creating local audio and video tracks...');
      try {
        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack()
        ]);
        
        console.log('[DEBUG] Local tracks created:', { audioTrack: !!audioTrack, videoTrack: !!videoTrack });
        
        localTracksRef.current.audioTrack = audioTrack;
        localTracksRef.current.videoTrack = videoTrack;
        
        // Publish local tracks
        console.log('[DEBUG] Publishing local tracks...');
        await client.publish([audioTrack, videoTrack]);
        console.log('[DEBUG] Local tracks published successfully');
        
        // Play local video track
        if (localVideoRef.current) {
          console.log('[DEBUG] Playing local video track...');
          videoTrack.play(localVideoRef.current);
          console.log('[DEBUG] Local video track playing');
        } else {
          console.error('[DEBUG] localVideoRef is not available for playback');
        }
      } catch (trackError) {
        console.error('[DEBUG] Error creating or publishing tracks:', trackError);
        throw trackError;
      }
      
      // Set recording start time
      setStartTime(new Date());
      setIsJoined(true);
    } catch (err) {
      console.error('Error joining call:', err);
      setError(err instanceof Error ? err.message : 'Failed to join call');
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, userId]);
  
  // Handle remote user published media
  const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
    console.log(`[DEBUG] Remote user ${user.uid} published ${mediaType} track`);
    
    try {
      // Subscribe to the remote user's track
      await clientRef.current?.subscribe(user, mediaType);
      console.log(`[DEBUG] Subscribed to ${mediaType} track of user ${user.uid}`);
      
      // Update remote users state to trigger re-render
      setRemoteUsers(prev => {
        // First check if this user already exists in our state
        if (prev.find(u => u.uid === user.uid)) {
          return prev.map(u => u.uid === user.uid ? user : u);
        } else {
          return [...prev, user];
        }
      });
      
      // Schedule playing tracks after a short delay to ensure DOM elements are ready
      setTimeout(() => {
        try {
          // Play remote tracks
          if (mediaType === 'video' && user.videoTrack) {
            console.log(`[DEBUG] Attempting to play remote video for user ${user.uid}`);
            const playerElement = document.getElementById(`player-${user.uid}`);
            
            if (playerElement) {
              console.log(`[DEBUG] Found player element for user ${user.uid}, playing video`);
              user.videoTrack.play(playerElement);
            } else {
              console.error(`[DEBUG] Player element for user ${user.uid} not found`);
              // Create container dynamically if it doesn't exist
              console.log('[DEBUG] Creating container dynamically...');
              const container = document.createElement('div');
              container.id = `player-${user.uid}`;
              container.style.width = '100%';
              container.style.height = '100%';
              container.style.backgroundColor = '#333';
              
              const remoteContainer = document.querySelector('.remote-videos-container');
              if (remoteContainer) {
                remoteContainer.appendChild(container);
                console.log(`[DEBUG] Container created, playing video in dynamic container`);
                user.videoTrack.play(`player-${user.uid}`);
              } else {
                console.error('[DEBUG] Remote videos container not found');
              }
            }
          }
          
          if (mediaType === 'audio' && user.audioTrack) {
            console.log(`[DEBUG] Playing remote audio for user ${user.uid}`);
            user.audioTrack.play();
          }
        } catch (playError) {
          console.error(`[DEBUG] Error playing ${mediaType} for user ${user.uid}:`, playError);
        }
      }, 500); // Half-second delay to ensure DOM is ready
    } catch (subscribeError) {
      console.error(`[DEBUG] Error handling remote user ${user.uid} ${mediaType}:`, subscribeError);
    }
  };
  
  // Handle remote user unpublished media
  const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
    // Update remote users state
    setRemoteUsers(prev => prev.map(u => u.uid === user.uid ? user : u));
  };
  
  // Handle remote user left
  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };
  
  // Handle network quality updates
  const handleNetworkQuality = (stats: any) => {
    setNetworkQuality(stats.downlinkNetworkQuality);
  };
  
  // Toggle video
  const toggleVideo = async () => {
    if (localTracksRef.current.videoTrack) {
      if (isVideoEnabled) {
        await localTracksRef.current.videoTrack.setEnabled(false);
      } else {
        await localTracksRef.current.videoTrack.setEnabled(true);
      }
      setIsVideoEnabled(!isVideoEnabled);
      
      // Record the setting change
      try {
        await fetch('/api/video/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            userId,
            event: 'setting',
            setting: {
              type: 'video',
              enabled: !isVideoEnabled
            }
          })
        });
      } catch (error) {
        console.error('Failed to track video setting change:', error);
      }
    }
  };
  
  // Toggle audio
  const toggleAudio = async () => {
    if (localTracksRef.current.audioTrack) {
      if (isAudioEnabled) {
        await localTracksRef.current.audioTrack.setEnabled(false);
      } else {
        await localTracksRef.current.audioTrack.setEnabled(true);
      }
      setIsAudioEnabled(!isAudioEnabled);
      
      // Record the setting change
      try {
        await fetch('/api/video/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            userId,
            event: 'setting',
            setting: {
              type: 'audio',
              enabled: !isAudioEnabled
            }
          })
        });
      } catch (error) {
        console.error('Failed to track audio setting change:', error);
      }
    }
  };
  
  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    if (isScreenSharing && localTracksRef.current.screenTrack) {
      // Stop screen sharing
      await clientRef.current?.unpublish(localTracksRef.current.screenTrack);
      localTracksRef.current.screenTrack.close();
      localTracksRef.current.screenTrack = null;
      
      // Republish video track if it was enabled
      if (isVideoEnabled && localTracksRef.current.videoTrack) {
        await clientRef.current?.publish(localTracksRef.current.videoTrack);
        if (localVideoRef.current) {
          localTracksRef.current.videoTrack.play(localVideoRef.current);
        }
      }
      
      setIsScreenSharing(false);
    } else {
      try {
        // Start screen sharing
        const screenTrackResult = await AgoraRTC.createScreenVideoTrack({}, 'auto');
        
        // Handle the case where screenTrack is an array [videoTrack, audioTrack]
        let videoScreenTrack: ILocalVideoTrack;
        
        if (Array.isArray(screenTrackResult)) {
          // It's [videoTrack, audioTrack]
          videoScreenTrack = screenTrackResult[0];
        } else {
          // It's just videoTrack
          videoScreenTrack = screenTrackResult;
        }
        
        localTracksRef.current.screenTrack = videoScreenTrack;
        
        // If video is enabled, unpublish it first
        if (isVideoEnabled && localTracksRef.current.videoTrack) {
          await clientRef.current?.unpublish(localTracksRef.current.videoTrack);
        }
        
        // Publish screen track
        await clientRef.current?.publish(videoScreenTrack);
        
        // Handle screen sharing ended by system UI
        videoScreenTrack.on('track-ended', async () => {
          await toggleScreenSharing();
        });
        
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Failed to start screen sharing:', error);
      }
    }
    
    // Record the setting change
    try {
      await fetch('/api/video/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          userId,
          event: 'setting',
          setting: {
            type: 'screenShare',
            enabled: !isScreenSharing
          }
        })
      });
    } catch (error) {
      console.error('Failed to track screen sharing change:', error);
    }
  };
  
  // Handle call end
  const handleCallEnd = async () => {
    try {
      // Track leave event
      await trackCallEvent('leave');
      
      // Close local tracks
      localTracksRef.current.audioTrack?.close();
      localTracksRef.current.videoTrack?.close();
      if (localTracksRef.current.screenTrack) {
        localTracksRef.current.screenTrack.close();
      }
      
      // Leave the channel
      await clientRef.current?.leave();
      
      // Call the onCallEnd callback if provided
      if (onCallEnd) {
        onCallEnd();
      }
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };
  
  // Auto-end call when time is up
  const handleTimeUp = () => {
    handleCallEnd();
  };
  
  // Initialize Agora when SDK is ready
  useEffect(() => {
    if (sdkReady) {
      initializeAgora();
    }
    
    // Cleanup when component unmounts
    return () => {
      if (sdkReady) {
        // Close local tracks
        localTracksRef.current.audioTrack?.close();
        localTracksRef.current.videoTrack?.close();
        if (localTracksRef.current.screenTrack) {
          localTracksRef.current.screenTrack.close();
        }
        
        // Leave the channel
        clientRef.current?.leave();
      }
    };
  }, [sdkReady, initializeAgora]);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-100 rounded-lg p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={onCallEnd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Back to Bookings
        </button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      {/* Main video area */}
      <div className="relative flex-1 bg-black">
        {/* Local video */}
        <div ref={localVideoRef} className="absolute inset-0 z-0" />
        
        {/* Remote videos */}
        <div className="absolute top-4 right-4 w-1/4 aspect-video flex flex-col gap-2 remote-videos-container">
          {remoteUsers.length > 0 ? (
            remoteUsers.map(user => (
              <div 
                key={user.uid} 
                id={`player-${user.uid}`} 
                className="w-full h-full bg-gray-800 rounded-lg overflow-hidden"
              />
            ))
          ) : (
            <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              <p className="text-gray-400 text-sm">Waiting for other participant...</p>
            </div>
          )}
        </div>
        
        {/* Call timer */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <CallTimer 
            duration={duration} 
            startTime={startTime} 
            onTimeUp={handleTimeUp} 
          />
        </div>
        
        {/* User labels */}
        <div className="absolute bottom-4 left-4 bg-gray-800/70 px-3 py-1 rounded-full text-white">
          <span className="text-sm">{userName} {!isVideoEnabled && '(Video Off)'}</span>
        </div>
        
        {/* Network quality indicator */}
        <div className="absolute bottom-4 right-4 bg-gray-800/70 px-3 py-1 rounded-full text-white flex items-center space-x-1">
          <span className="text-xs">Network:</span>
          <div className="flex space-x-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-1 h-3 rounded-sm ${i < networkQuality ? 'bg-green-500' : 'bg-gray-600'}`} 
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Call controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center space-x-6">
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'}`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          <VideoCameraIcon className="h-6 w-6 text-white" />
        </button>
        
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-500'}`}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          <MicrophoneIcon className="h-6 w-6 text-white" />
        </button>
        
        <button
          onClick={toggleScreenSharing}
          className={`p-3 rounded-full transition-colors ${isScreenSharing ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-700 hover:bg-gray-600'}`}
          title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
        >
          <ComputerDesktopIcon className="h-6 w-6 text-white" />
        </button>
        
        <button
          onClick={handleCallEnd}
          className="p-3 rounded-full bg-red-600 hover:bg-red-500 transition-colors"
          title="End call"
        >
          <PhoneIcon className="h-6 w-6 text-white transform rotate-135" />
        </button>
      </div>
    </div>
  );
}
