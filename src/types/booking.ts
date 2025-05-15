import { type BookingWithRelations, type BookingStatus } from './schema';

export interface Booking {
  id: string;
  userId: string;
  expertId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: BookingStatus;
  transcriptUrl?: string | null;
  expert: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      isExpert: boolean;
    };
    title: string;
    categories: string[];
    pricePerHour: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
    isExpert: boolean;
  };
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedBooking {
  id: string;
  userId: string;
  expertId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: BookingStatus;
  transcriptUrl?: string | null;
  expert: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      isExpert: boolean;
    };
    title: string;
    categories: string[];
    pricePerHour: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
    isExpert: boolean;
  };
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export const serializeBooking = (booking: BookingWithRelations): SerializedBooking => {
  return {
    id: booking.id,
    userId: booking.userId,
    expertId: booking.expertId,
    scheduledAt: booking.scheduledAt.toISOString(),
    durationMinutes: booking.durationMinutes,
    status: booking.status as BookingStatus,
    transcriptUrl: booking.transcriptUrl,
    expert: {
      id: booking.expert.id,
      user: {
        id: booking.expert.user.id,
        name: booking.expert.user.firstName + ' ' + booking.expert.user.lastName,
        email: booking.expert.user.email,
        isExpert: booking.expert.user.isExpert,
      },
      title: booking.expert.title,
      categories: booking.expert.categories,
      pricePerHour: booking.expert.pricePerHour,
    },
    user: {
      id: booking.user.id,
      name: booking.user.firstName + ' ' + booking.user.lastName,
      email: booking.user.email,
      isExpert: booking.user.isExpert,
    },
    totalCost: booking.durationMinutes * (booking.expert.pricePerHour / 60),
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
};
