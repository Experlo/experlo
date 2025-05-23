import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

// Define protected routes that require authentication
const protectedRoutes = [
  '/profile',
  '/experts',
  '/bookings'
];

// Define auth routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/auth/login',
  '/auth/register'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for public assets and API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if the current route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  const authToken = request.cookies.get('auth_token');
  
  let isAuthenticated = false;
  
  if (authToken?.value) {
    try {
      const payload = await verifyToken(authToken.value);
      isAuthenticated = !!payload;
    } catch (error) {
      // Invalid token - treat as not authenticated
      isAuthenticated = false;
    }
  }

  const baseUrl = request.nextUrl.origin;

  // Redirect unauthenticated users from protected routes to login
  if (!isAuthenticated && isProtectedRoute) {
    const url = new URL('/auth/login', baseUrl);
    url.searchParams.set('callbackUrl', encodeURIComponent(request.nextUrl.pathname));
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from auth routes to root (which will show dashboard)
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/', baseUrl));
  }
  
  // Handle root path based on authentication
  if (pathname === '/') {
    if (!isAuthenticated) {
      // Unauthenticated users see the landing page
      return NextResponse.next();
    }
    // Authenticated users will see the dashboard (handled in the page component)
    return NextResponse.next();
  }
  
  // Redirect /dashboard to root path since dashboard is now at the root
  if (pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/', baseUrl));
  }

  // Allow access to all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/dashboard/:path*',
    '/profile/:path*',
    '/experts/:path*',
    '/bookings/:path*',
    '/auth/:path*'
  ]
};
