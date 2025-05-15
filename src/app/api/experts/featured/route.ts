import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { type SerializedExpert } from '@/types/expert';

type ExpertWithRelations = Prisma.ExpertProfileGetPayload<{
  include: {
    user: true;
    bookings: true;
  };
}>;

export async function GET() {
  try {
    // Get top 4 experts by rating
    const experts = await prisma.expertProfile.findMany({
      take: 4,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true,
        bookings: true,
      } as Prisma.ExpertProfileInclude,
    });

    // Transform the data to match SerializedExpert type
    const serializedExperts: SerializedExpert[] = experts.map((expert: ExpertWithRelations) => ({
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
    console.error('Error fetching featured experts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured experts' },
      { status: 500 }
    );
  }
}
