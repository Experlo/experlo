'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoCallProps {
  meetingUrl: string;
}

export default function VideoCall({ meetingUrl }: VideoCallProps) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (meetingUrl && iframeRef.current) {
      setIsLoading(false);
    }
  }, [meetingUrl]);

  if (!meetingUrl) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Meeting link not available yet</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-50">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={meetingUrl}
        className="w-full h-full"
        allow="camera; microphone; fullscreen"
      />
    </div>
  );
}
