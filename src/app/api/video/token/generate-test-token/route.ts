import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export async function POST(request: Request) {
  try {
    // Get request body
    const { channelName, uid } = await request.json();
    
    if (!channelName) {
      return NextResponse.json(
        { error: 'Channel name is required' },
        { status: 400 }
      );
    }

    // Get Agora credentials from environment variables
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    
    if (!appId || !appCertificate) {
      console.error('Agora credentials missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Convert string UID to number if needed
    const uidNumber = typeof uid === 'number' ? uid : parseInt(uid) || Math.floor(Math.random() * 100000);
    
    // Set token expiration (in seconds)
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    
    // Build the token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uidNumber,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );
    
    return NextResponse.json({ token, uid: uidNumber, channelName });
  } catch (error) {
    console.error('Error generating test token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
