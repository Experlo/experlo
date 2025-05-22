import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SerializedExpert } from '@/types/expert';
import ExpertProfile from '@/features/expert/components/ExpertProfile';

type ExpertPageProps = {
  params: {
    id: string;
  };
};

export default async function ExpertPage({ params }: ExpertPageProps) {
  if (!params.id) {
    notFound();
  }

  try {
    // Fetch the expert with all related data
    const expert = await prisma.expertProfile.findUnique({
      where: {
        id: params.id.replace('_', ''),
      },
      include: {
        user: true,
        bookings: true,
        education: true,
        experience: true,
        certifications: true,
        reviews: true,
        availableTimeSlots: true,
      },
    });

    // If expert not found, show 404
    if (!expert) {
      notFound();
    }

    // Calculate derived data
    const totalConsultationMinutes = expert.bookings.reduce(
      (total, booking) => total + (booking.durationMinutes || 0), 
      0
    );
    
    const averageRating = expert.reviews.length 
      ? expert.reviews.reduce((total, review) => total + review.rating, 0) / expert.reviews.length 
      : 0;

    // Prepare the serialized expert for the client
    const serializedExpert: SerializedExpert = {
      id: expert.id,
      userId: expert.userId,
      user: {
        id: expert.user.id,
        firstName: expert.user.firstName || '',
        lastName: expert.user.lastName || '',
        email: expert.user.email,
        isExpert: expert.user.isExpert,
        image: expert.user.image || undefined,
        gender: expert.user.gender || undefined,
        dateOfBirth: expert.user.dateOfBirth ? 
          (expert.user.dateOfBirth instanceof Date ? 
            expert.user.dateOfBirth.toISOString() : 
            String(expert.user.dateOfBirth)) : 
          undefined,
        createdAt: expert.user.createdAt instanceof Date ? 
          expert.user.createdAt.toISOString() : 
          String(expert.user.createdAt),
        updatedAt: expert.user.updatedAt instanceof Date ? 
          expert.user.updatedAt.toISOString() : 
          String(expert.user.updatedAt),
      },
      title: expert.title,
      bio: expert.bio,
      pricePerHour: expert.pricePerHour,
      isAvailable: expert.isAvailable,
      categories: expert.categories,
      education: expert.education.map(ed => ({
        id: ed.id,
        institution: ed.school || '', // Convert school to institution
        degree: ed.degree,
        field: ed.field,
        startYear: ed.startYear,
        endYear: ed.endYear,
        expertId: ed.expertId,
        createdAt: ed.createdAt instanceof Date ? ed.createdAt.toISOString() : String(ed.createdAt),
        updatedAt: ed.updatedAt instanceof Date ? ed.updatedAt.toISOString() : String(ed.updatedAt),
      })),
      experience: expert.experience.map(exp => ({
        id: exp.id,
        company: exp.company,
        position: exp.position,
        description: exp.description,
        startYear: exp.startYear,
        endYear: exp.endYear !== null ? exp.endYear : undefined, // Convert null to undefined
        expertId: exp.expertId,
        createdAt: exp.createdAt instanceof Date ? exp.createdAt.toISOString() : String(exp.createdAt),
        updatedAt: exp.updatedAt instanceof Date ? exp.updatedAt.toISOString() : String(exp.updatedAt),
      })),
      certifications: expert.certifications.map(cert => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        year: cert.year,
        expertId: cert.expertId,
        issuingOrganization: cert.issuer, // Use issuer as issuingOrganization
        issueDate: `${cert.year}-01-01`, // Create a date string from the year
        createdAt: cert.createdAt instanceof Date ? cert.createdAt.toISOString() : String(cert.createdAt),
        updatedAt: cert.updatedAt instanceof Date ? cert.updatedAt.toISOString() : String(cert.updatedAt),
      })),
      totalBookings: expert.bookings.length,
      totalConsultationMinutes,
      rating: averageRating,
      reviews: expert.reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment || undefined, // Convert null to undefined
        userId: review.userId,
        expertId: review.expertId,
        createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : String(review.createdAt),
        updatedAt: review.updatedAt instanceof Date ? review.updatedAt.toISOString() : String(review.updatedAt),
      })),
      availableTimeSlots: expert.availableTimeSlots.map(slot => ({
        id: slot.id,
        startTime: slot.startTime instanceof Date ? slot.startTime.toISOString() : String(slot.startTime),
        endTime: slot.endTime instanceof Date ? slot.endTime.toISOString() : String(slot.endTime),
        isBooked: slot.isBooked,
        expertId: slot.expertId,
        createdAt: slot.createdAt instanceof Date ? slot.createdAt.toISOString() : String(slot.createdAt),
        updatedAt: slot.updatedAt instanceof Date ? slot.updatedAt.toISOString() : String(slot.updatedAt),
      })),
      bookings: expert.bookings.map(booking => ({
        id: booking.id,
        userId: booking.userId,
        expertId: booking.expertId,
        scheduledAt: booking.scheduledAt instanceof Date ? booking.scheduledAt.toISOString() : String(booking.scheduledAt),
        durationMinutes: booking.durationMinutes,
        status: booking.status as unknown as import('@/types/schema').BookingStatus, // Type conversion to ensure compatibility
        transcriptUrl: booking.transcriptUrl || undefined,
        expert: {
          id: expert.id,
          user: {
            id: expert.user.id,
            name: `${expert.user.firstName} ${expert.user.lastName}`,
            email: expert.user.email,
            isExpert: expert.user.isExpert,
          },
          title: expert.title,
          categories: expert.categories,
          pricePerHour: expert.pricePerHour,
        },
        user: {
          id: expert.user.id, // Using expert's user as a fallback
          name: `${expert.user.firstName} ${expert.user.lastName}`,
          email: expert.user.email,
          isExpert: expert.user.isExpert,
        },
        totalCost: booking.durationMinutes * (expert.pricePerHour / 60), // Calculate cost based on duration and hourly rate
        createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : String(booking.createdAt),
        updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt.toISOString() : String(booking.updatedAt),
      })),
      createdAt: expert.createdAt instanceof Date ? expert.createdAt.toISOString() : String(expert.createdAt),
      updatedAt: expert.updatedAt instanceof Date ? expert.updatedAt.toISOString() : String(expert.updatedAt),
    };

    // Render the expert profile component with the serialized data
    return <ExpertProfile expert={serializedExpert} />;
  } catch (error) {
    console.error('Error fetching expert profile:', error);
    throw error;
  }
}
