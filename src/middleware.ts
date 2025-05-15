import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log('Middleware - Path:', pathname);
  
  // Skip middleware for public assets and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if the current route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  const authToken = request.cookies.get('auth_token');
  console.log('Middleware - Auth token exists:', !!authToken);
  
  // Use the previously defined isAuthRoute
  console.log('Middleware - Is auth route:', isAuthRoute);
  
  let isAuthenticated = false;
  let payload = null;
  
  if (authToken?.value) {
    try {
      payload = await verifyToken(authToken.value);
      isAuthenticated = !!payload;
      console.log('Middleware - Token payload:', payload);
    } catch (error: any) {
      console.error('Middleware - Invalid token:', error?.message || 'Unknown error');
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }
  
  console.log('Middleware - Auth status:', { isAuthenticated, isAuthRoute });

  const baseUrl = request.nextUrl.origin;

  if (!isAuthenticated && isProtectedRoute) {
    const url = new URL('/auth/login', baseUrl);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', baseUrl));
  }

  return NextResponse.next();
}

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/experts',
  '/bookings'
];

// Define auth routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/auth/login',
  '/auth/register'
];

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/experts/:path*',
    '/bookings/:path*',
    '/auth/:path*'
  ]
};
