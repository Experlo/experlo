import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/auth/jwt';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Remove the auth cookie
  const cookie = removeAuthCookie();
  response.cookies.set(cookie);

  return response;
}
