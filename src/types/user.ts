import { Prisma } from '@prisma/client';

export interface SerializedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string | null;
  isExpert: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User extends SerializedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  image?: string | null;
  password: string;
  isExpert: boolean;
  createdAt: string;
  updatedAt: string;
}

// Prisma types with relations
export type UserWithExpertProfile = Prisma.UserGetPayload<{
  include: { expertProfile: true };
}>;

export type ExpertProfileWithBookings = Prisma.ExpertProfileGetPayload<{
  include: { bookings: true; user: true };
}>;

export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: { user: true; expert: { include: { user: true } } };
}>;