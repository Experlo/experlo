import { NextResponse } from 'next/server';
import { verifyToken, getAuthToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import type { User } from '@/types/user';
import type { Expert } from '@/types/expert';

interface UserWithExpertProfile extends Omit<User, 'createdAt' | 'updatedAt'> {
  expertProfile?: Expert | null;
  createdAt: string;
  updatedAt: string;
}
import { serializeExpert } from '@/types/expert';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  // Accept both URLs and local file paths for images
  image: z.string().refine(
    (val) => val.startsWith('/uploads/') || val.startsWith('http') || val === null,
    { message: 'Image must be a valid URL or a local file path' }
  ).optional(),
  bio: z.string().optional(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable()
});

export async function GET() {
  try {
    const token = await getAuthToken();
    console.log('Auth token:', token);
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    console.log('Token payload:', payload);

    if (!payload?.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userFromDb = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        expertProfile: {
          include: {
            education: true,
            experience: true,
            certifications: true,
            reviews: {
              include: {
                user: true
              }
            },
            availableTimeSlots: true,
            bookings: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!userFromDb) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Use type assertion to fix type issues
    const user = {
      ...userFromDb,
      createdAt: userFromDb.createdAt instanceof Date ? userFromDb.createdAt.toISOString() : userFromDb.createdAt,
      updatedAt: userFromDb.updatedAt instanceof Date ? userFromDb.updatedAt.toISOString() : userFromDb.updatedAt,
    } as unknown as UserWithExpertProfile;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Base user data that everyone can see
    const response: UserWithExpertProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      isExpert: user.isExpert,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Add expert profile data if the user is an expert
    if (user.isExpert && user.expertProfile) {
      const expertData = serializeExpert(user.expertProfile as Expert);
      response.expertProfile = expertData;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const token = await getAuthToken();
    const payload = token ? await verifyToken(token) : null;

    if (!payload?.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, image, bio, gender, dateOfBirth } = updateProfileSchema.parse(body);

    const updateData: any = {
      firstName,
      lastName,
      ...(image && { image }),
      ...(gender !== undefined && { gender }),
      ...(dateOfBirth !== undefined && { dateOfBirth }),
    };

    // Get updated user and convert dates to strings
    const updatedUserRaw = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      include: {
        expertProfile: {
          include: {
            education: true,
            experience: true,
            certifications: true,
            reviews: true,
            availableTimeSlots: true,
            bookings: {
              include: {
                user: true,
                expert: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    // Convert to UserWithExpertProfile with proper date handling
    const updatedUser = {
      ...updatedUserRaw,
      createdAt: updatedUserRaw.createdAt instanceof Date ? updatedUserRaw.createdAt.toISOString() : updatedUserRaw.createdAt,
      updatedAt: updatedUserRaw.updatedAt instanceof Date ? updatedUserRaw.updatedAt.toISOString() : updatedUserRaw.updatedAt,
    } as unknown as UserWithExpertProfile;

    // Base response for all users
    const response: any = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      image: updatedUser.image,
      gender: updatedUser.gender,
      dateOfBirth: updatedUser.dateOfBirth,
      isExpert: updatedUser.isExpert,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    // Add expert profile data if the user is an expert
    if (updatedUser.isExpert && updatedUser.expertProfile) {
      const expertData = serializeExpert(updatedUser.expertProfile as any);
      response.expertProfile = expertData;
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
