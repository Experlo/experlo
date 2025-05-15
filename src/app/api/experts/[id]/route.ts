import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const expert = await prisma.expertProfile.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            isExpert: true,
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!expert) {
      return NextResponse.json(
        { error: 'Expert not found' },
        { status: 404 }
      );
    }

    // Transform to SerializedExpert
    const serializedExpert = {
      id: expert.id,
      userId: expert.userId,
      user: {
        id: expert.user.id,
        name: `${expert.user.firstName} ${expert.user.lastName}`,
        email: expert.user.email,
        isExpert: expert.user.isExpert,
        image: expert.user.image,
      },
      title: expert.title,
      bio: expert.bio,
      pricePerHour: expert.pricePerHour,
      isAvailable: expert.isAvailable,
      categories: expert.categories,
      totalBookings: expert.bookings.length,
      rating: 5, // TODO: Implement actual rating system
    };

    return NextResponse.json(serializedExpert);
  } catch (error) {
    console.error('Error fetching expert:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expert' },
      { status: 500 }
    );
  }
}
