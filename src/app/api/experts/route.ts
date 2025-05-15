import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

export async function GET() {
  try {
    const experts = await prisma.expertProfile.findMany({
      include: {
        user: true,
        bookings: true,
      } as Prisma.ExpertProfileInclude,
    });

    // Transform the data to match SerializedExpert type
    const serializedExperts = experts.map((expert) => ({
      id: expert.id,
      userId: expert.userId,
      user: {
        id: expert.user.id,
        firstName: expert.user.firstName,
        lastName: expert.user.lastName,
        email: expert.user.email,
        isExpert: expert.user.isExpert,
        image: expert.user.image || undefined,
        createdAt: expert.user.createdAt.toISOString(),
        updatedAt: expert.user.updatedAt.toISOString(),
      },
      title: expert.title,
      bio: expert.bio,
      pricePerHour: expert.pricePerHour,
      isAvailable: expert.isAvailable,
      categories: expert.categories,
      education: [],
      experience: [],
      certifications: [],
      totalBookings: expert.bookings.length,
      totalConsultationMinutes: expert.bookings.reduce((total: number, booking: any) => {
        return total + (booking.durationMinutes || 0);
      }, 0),
      rating: 5, // Default rating for now
      reviews: [],
      availableTimeSlots: [],
      createdAt: expert.createdAt.toISOString(),
      updatedAt: expert.updatedAt.toISOString(),
    }));

    return NextResponse.json(serializedExperts);
  } catch (error) {
    console.error('Error fetching experts:', error);
    return NextResponse.json(
      { status: 500, message: 'Failed to fetch experts' }
    );
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
        { message: 'Missing required fields' },
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
        education.map((edu: EducationInput) => {
          return tx.education.create({
            data: {
              expert: { connect: { id: expertProfile.id } },
              ...edu
            }
          });
        })
      );

      // Create experience records
      const experienceRecords = await Promise.all(
        experience.map((exp: ExperienceInput) => {
          return tx.experience.create({
            data: {
              expert: { connect: { id: expertProfile.id } },
              ...exp
            }
          });
        })
      );

      // Create certification records
      const certificationRecords = await Promise.all(
        certifications.map((cert: CertificationInput) => {
          return tx.certification.create({
            data: {
              expert: { connect: { id: expertProfile.id } },
              ...cert
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

    // Update user isExpert status
    await prisma.user.update({
      where: { id: payload.userId },
      data: { isExpert: true }
    });

    // Transform to SerializedExpert type
    const serializedExpert: SerializedExpert = {
      id: result.profile.id,
      userId: result.profile.userId,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
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
    return NextResponse.json(
      { message: 'Failed to create expert profile' },
      { status: 500 }
    );
  }
}
