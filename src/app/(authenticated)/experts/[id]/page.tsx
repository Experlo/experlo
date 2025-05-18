import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SerializedExpert, ExpertProfileWithBookings } from '@/types/expert';
import ExpertProfile from '@/features/expert/components/ExpertProfile';
import type { Prisma } from '@prisma/client';

const expertInclude = {
  user: true,
  bookings: true,
  education: true,
  experience: true,
  certifications: true,
  reviews: true,
  availableTimeSlots: true,
} as const;

interface ExpertPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ExpertPage({ params: paramsPromise }: ExpertPageProps) {
  const params = await paramsPromise;
  const expert = await prisma.expertProfile.findUnique({
    where: {
      id: params.id.replace('_', ''),
    },
    include: expertInclude,
  }) as unknown as ExpertProfileWithBookings | null;

  if (!expert) {
    notFound();
  }

  const totalConsultationMinutes = expert?.bookings?.reduce((total: number, booking) => total + (booking.durationMinutes || 0), 0) || 0;
  const averageRating = expert?.reviews?.length ? 
    expert.reviews.reduce((total: number, review) => total + review.rating, 0) / expert.reviews.length : 0;

  const serializedExpert: SerializedExpert = {
    id: expert.id,
    userId: expert.userId,
    user: {
      id: expert.user.id,
      firstName: expert.user.firstName,
      lastName: expert.user.lastName,
      email: expert.user.email,
      isExpert: expert.user.isExpert,
      image: expert.user.image || undefined,
      gender: expert.user.gender, // Add missing gender field
      dateOfBirth: expert.user.dateOfBirth, // Add missing dateOfBirth field
      createdAt: expert.user.createdAt,
      updatedAt: expert.user.updatedAt,
    },
    title: expert.title,
    bio: expert.bio,
    pricePerHour: expert.pricePerHour,
    isAvailable: expert.isAvailable,
    categories: expert.categories,
    education: expert.education,
    experience: expert.experience,
    certifications: expert.certifications,
    totalBookings: expert.bookings.length,
    totalConsultationMinutes,
    rating: averageRating,
    reviews: expert.reviews,
    availableTimeSlots: expert.availableTimeSlots,
    bookings: expert.bookings, // Add missing bookings field
    createdAt: typeof expert.createdAt === 'object' && expert.createdAt !== null ? (expert.createdAt as Date).toISOString() : expert.createdAt,
    updatedAt: typeof expert.updatedAt === 'object' && expert.updatedAt !== null ? (expert.updatedAt as Date).toISOString() : expert.updatedAt
  };

  return <ExpertProfile expert={serializedExpert} />;
}
