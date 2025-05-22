import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { type SerializedExpert } from '@/types/expert';
import { verifyToken, getAuthToken } from '@/lib/auth/jwt';
import type { User } from '@/types/user';

interface EducationInput {
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
}

interface ExperienceInput {
  company: string;
  position: string;
  description: string;
  startYear: number;
  endYear?: number;
}

interface CertificationInput {
  name: string;
  issuer: string;
  year: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse search and filter parameters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || 1000;
    const minRating = Number(searchParams.get('minRating')) || 0;
    
    // Get the current user from the auth token
    const token = await getAuthToken();
    let currentUserId: string | undefined;
    
    if (token) {
      try {
        const payload = await verifyToken(token);
        currentUserId = payload?.userId;
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
    
    // Build the where clause with filters
    let whereClause: Prisma.ExpertProfileWhereInput = {};
    
    // Exclude current user if logged in
    if (currentUserId) {
      whereClause.userId = { not: currentUserId };
    }
    
    // Apply price range filter
    whereClause.pricePerHour = {
      gte: minPrice,
      lte: maxPrice
    };
    
    // Apply category filter if specified
    if (category) {
      whereClause.categories = {
        has: category
      };
    }
    
    // Apply rating filter
    whereClause.rating = {
      gte: minRating
    };
    
    // Find experts with the applied filters
    const experts = await prisma.expertProfile.findMany({
      where: whereClause,
      include: {
        user: true,
        bookings: true,
        education: true,
        experience: true,
        certifications: true,
      } as Prisma.ExpertProfileInclude,
    });
    
    // Further filter experts by search term (name/title/bio)
    let filteredExperts = experts;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredExperts = experts.filter(expert => {
        const fullName = `${expert.user.firstName} ${expert.user.lastName}`.toLowerCase();
        const titleLower = expert.title.toLowerCase();
        const bioLower = expert.bio.toLowerCase();
        
        return fullName.includes(searchLower) || 
               titleLower.includes(searchLower) || 
               bioLower.includes(searchLower);
      });
    }

    // Transform the data to match SerializedExpert type
    const serializedExperts = filteredExperts.map((expert) => ({
      id: expert.id,
      userId: expert.userId,
      user: {
        id: expert.user.id,
        firstName: expert.user.firstName,
        lastName: expert.user.lastName,
        email: expert.user.email,
        isExpert: expert.user.isExpert,
        image: expert.user.image || undefined,
        gender: expert.user.gender || null,
        dateOfBirth: expert.user.dateOfBirth ? expert.user.dateOfBirth.toISOString() : null,
        createdAt: expert.user.createdAt.toISOString(),
        updatedAt: expert.user.updatedAt.toISOString(),
      },
      title: expert.title,
      bio: expert.bio,
      pricePerHour: expert.pricePerHour,
      isAvailable: expert.isAvailable,
      categories: expert.categories,
      education: expert.education.map(edu => ({
        id: edu.id,
        school: edu.school,
        degree: edu.degree,
        field: edu.field,
        startYear: edu.startYear,
        endYear: edu.endYear,
        createdAt: edu.createdAt.toISOString(),
        updatedAt: edu.updatedAt.toISOString(),
      })),
      experience: expert.experience.map(exp => ({
        id: exp.id,
        company: exp.company,
        position: exp.position,
        description: exp.description,
        startYear: exp.startYear,
        endYear: exp.endYear || null,
        createdAt: exp.createdAt.toISOString(),
        updatedAt: exp.updatedAt.toISOString(),
      })),
      certifications: expert.certifications.map(cert => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        year: cert.year,
        createdAt: cert.createdAt.toISOString(),
        updatedAt: cert.updatedAt.toISOString(),
      })),
      totalBookings: expert.bookings.length,
      totalConsultationMinutes: expert.bookings.reduce((total: number, booking: any) => {
        return total + (booking.durationMinutes || 0);
      }, 0),
      rating: 5, // Default rating for now
      reviews: [],
      availableTimeSlots: [],
      bookings: expert.bookings || [],
      createdAt: expert.createdAt.toISOString(),
      updatedAt: expert.updatedAt.toISOString(),
    }));

    return NextResponse.json(serializedExperts);
  } catch (error) {
    console.error('Error fetching experts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch experts', message: error instanceof Error ? error.message : 'Unknown error' }
    , { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { title, bio, categories, pricePerHour, education, experience, certifications, isAvailable } = data;

    // Validate required fields
    if (!title || !bio || !categories || categories.length === 0 || !pricePerHour) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill in all required information.' },
        { status: 400 }
      );
    }

    // Create expert profile
    // Create expert profile with relations in a transaction
    // Fetch user first to ensure they exist
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create expert profile and related records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create expert profile
      const expertProfile = await tx.expertProfile.create({
        data: {
          userId: payload.userId,
          title,
          bio,
          categories,
          pricePerHour,
          isAvailable: isAvailable ?? true
        }
      });

      // Create education records
      const educationRecords = await Promise.all(
        education.map((edu: any) => {
          return tx.education.create({
            data: {
              expert: { connect: { id: expertProfile.id } },
              school: edu.institution || edu.school || '',  // Handle both institution and school fields
              degree: edu.degree || '',
              field: edu.field || '',
              startYear: edu.startYear || 0,
              endYear: edu.endYear || 0
            }
          });
        })
      );

      // Create experience records
      const experienceRecords = await Promise.all(
        experience.map((exp: any) => {
          return tx.experience.create({
            data: {
              expert: { connect: { id: expertProfile.id } },
              company: exp.company || '',
              position: exp.position || '',
              description: exp.description || '',
              startYear: exp.startYear || 0,
              endYear: exp.endYear || null
            }
          });
        })
      );

      // Create certification records
      const certificationRecords = await Promise.all(
        certifications.map((cert: any) => {
          return tx.certification.create({
            data: {
              expert: { connect: { id: expertProfile.id } },
              name: cert.name || '',
              issuer: (cert.issuingOrganization || cert.issuer || ''),
              year: parseInt((cert.issueDate?.split('-')[0]) || '') || new Date().getFullYear()
            }
          });
        })
      );

      // Update user isExpert status
      await tx.user.update({
        where: { id: payload.userId },
        data: { isExpert: true }
      });

      return {
        profile: expertProfile,
        education: educationRecords,
        experience: experienceRecords,
        certifications: certificationRecords
      };
    });

    // User isExpert status was already updated in the transaction

    // Transform to SerializedExpert type
    const serializedExpert: SerializedExpert = {
      id: result.profile.id,
      userId: result.profile.userId,
      user: {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        isExpert: true,
        image: user.image || undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      title: result.profile.title,
      bio: result.profile.bio,
      pricePerHour: result.profile.pricePerHour,
      isAvailable: result.profile.isAvailable,
      categories: result.profile.categories,
      education: result.education.map(edu => ({
        ...edu,
        createdAt: edu.createdAt.toISOString(),
        updatedAt: edu.updatedAt.toISOString()
      })),
      experience: result.experience.map(exp => ({
        ...exp,
        createdAt: exp.createdAt.toISOString(),
        updatedAt: exp.updatedAt.toISOString()
      })),
      certifications: result.certifications.map(cert => ({
        ...cert,
        createdAt: cert.createdAt.toISOString(),
        updatedAt: cert.updatedAt.toISOString()
      })),
      bookings: [], // Add missing bookings property
      totalBookings: 0,
      totalConsultationMinutes: 0,
      rating: 5,
      reviews: [],
      availableTimeSlots: [],
      createdAt: result.profile.createdAt.toISOString(),
      updatedAt: result.profile.updatedAt.toISOString(),
    };

    return NextResponse.json(serializedExpert);
  } catch (error) {
    console.error('Error creating expert profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create expert profile: ${errorMessage}` },
      { status: 500 }
    );
  }
}
