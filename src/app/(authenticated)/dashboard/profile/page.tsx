import { notFound } from 'next/navigation';
import { getAuthToken, verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import UserProfile from '@/features/profile/components/UserProfile';
import type { UserWithExpertProfile } from '@/types/schema';

export default async function ProfilePage() {
  const token = await getAuthToken();
  const payload = token ? await verifyToken(token) : null;

  if (!payload?.userId) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    include: {
      expertProfile: true
    }
  }) as UserWithExpertProfile | null;

  if (!user) {
    notFound();
  }

  const serializedUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.image,

    isExpert: user.isExpert,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  const expertData = user.expertProfile
    ? {
        _id: user.expertProfile.id,
        userId: user.id,
        user: serializedUser,
        title: user.expertProfile.title,
        bio: user.expertProfile.bio,
        pricePerHour: user.expertProfile.pricePerHour,
        isAvailable: user.expertProfile.isAvailable,
        categories: user.expertProfile.categories,
        education: [],
        experience: [],
        certifications: [],
        totalBookings: 0,
        totalConsultationMinutes: 0,
        rating: 5,
        reviews: [],
        availableTimeSlots: [],
        createdAt: user.expertProfile.createdAt.toISOString(),
        updatedAt: user.expertProfile.updatedAt.toISOString()
      }
    : null;

  return <UserProfile user={serializedUser} isOwnProfile expertData={expertData} />;
}
