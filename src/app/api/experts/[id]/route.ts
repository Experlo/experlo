import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SerializedExpert } from '@/types/expert';

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
            gender: true,
            dateOfBirth: true,
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

    // Debug log for gender data
    console.log('Expert data from database:', expert);
    console.log('User gender from database (raw):', expert.user.gender, typeof expert.user.gender);
    
    // Normalize gender value
    let normalizedGender = expert.user.gender;
    if (normalizedGender) {
      // Convert to lowercase and trim any whitespace
      normalizedGender = normalizedGender.toLowerCase().trim();
      console.log('Normalized gender:', normalizedGender);
    } else {
      console.log('Gender is null or undefined');
    }
    
    console.log('User firstName from database:', expert.user.firstName);
    console.log('User dateOfBirth from database:', expert.user.dateOfBirth, typeof expert.user.dateOfBirth);
    
    // Use type assertion to avoid TypeScript errors
    const expertWithUser = expert as unknown as { 
      id: string; 
      userId: string; 
      user: { 
        id: string; 
        firstName: string; 
        lastName: string; 
        email: string; 
        image: string | null; 
        gender: string | null; 
        dateOfBirth: string | null; 
        isExpert: boolean; 
      }; 
      title: string; 
      bio: string; 
      pricePerHour: number; 
      isAvailable: boolean; 
      categories: string[]; 
      bookings: any[]; 
    };
    
    // Transform to SerializedExpert
    const serializedExpert: SerializedExpert = {
      id: expertWithUser.id,
      userId: expertWithUser.userId,
      user: {
        id: expertWithUser.user.id,
        firstName: expertWithUser.user.firstName,
        lastName: expertWithUser.user.lastName,
        email: expertWithUser.user.email,
        isExpert: expertWithUser.user.isExpert,
        image: expertWithUser.user.image,
        gender: normalizedGender || null,
        dateOfBirth: expertWithUser.user.dateOfBirth,
        createdAt: '', // These fields are required by SerializedUser but not used here
        updatedAt: ''
      },
      title: expertWithUser.title || '',
      bio: expertWithUser.bio || '',
      pricePerHour: expertWithUser.pricePerHour || 0,
      isAvailable: expertWithUser.isAvailable || false,
      categories: expertWithUser.categories || [],
      education: [],
      experience: [],
      certifications: [],
      totalBookings: expertWithUser.bookings?.length || 0,
      totalConsultationMinutes: 0,
      rating: 5, // TODO: Implement actual rating system
      reviews: [],
      availableTimeSlots: [],
      bookings: expertWithUser.bookings?.map((b: any) => ({
        ...b,
        user: { id: '', firstName: '', lastName: '', email: '', isExpert: false, createdAt: '', updatedAt: '' },
        createdAt: '',
        updatedAt: ''
      })) || [],
      createdAt: '',
      updatedAt: ''
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
