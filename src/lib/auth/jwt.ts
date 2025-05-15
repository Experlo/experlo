import * as jose from 'jose';
import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'experlo-development-secret-key-do-not-use-in-production'
);
const TOKEN_NAME = 'auth_token';

export interface JWTPayload extends jose.JWTPayload {
  userId: string;
  email: string;
  isExpert: boolean;
}

export const signToken = async (payload: JWTPayload): Promise<string> => {
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  return token;
};

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const decoded = payload as unknown as JWTPayload;
    if (!decoded || typeof decoded !== 'object') return null;
    if (!decoded.userId || !decoded.email) return null;
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};

export const setAuthCookie = (token: string): ResponseCookie => {
  return {
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  };
};

export const getAuthToken = async (): Promise<string | undefined> => {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(TOKEN_NAME);
    console.log('Auth cookie:', authCookie);
    return authCookie?.value;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return undefined;
  }
};

export const removeAuthCookie = (): ResponseCookie => {
  return {
    name: TOKEN_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  };
};
