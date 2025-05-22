import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, setAuthCookie } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    console.log('Login request received');
    const body = await request.json();
    console.log('Request body:', body);
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Finding user with email:', email);
    const user = await prisma.user.findUnique({
      where: { email }
    });
    console.log('Found user:', user);
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      isExpert: user.isExpert
    });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isExpert: user.isExpert
        }
      },
      { status: 200 }
    );

    // Set the cookie - only set once with easier to work with settings
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: false, // Definitely false for local development
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });
    
    // Also set a non-httpOnly version for client-side detection
    response.cookies.set({
      name: 'auth_token_client',
      value: 'authenticated', // Just a flag, not the actual token for security
      httpOnly: false, // Allow JavaScript access
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    // Log for debugging
    console.log('Login successful');
    console.log('Auth token cookie:', token);
    console.log('Response cookies:', response.cookies.getAll());
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
