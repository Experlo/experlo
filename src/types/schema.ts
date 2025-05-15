import { User } from './user';

export type { User };

export type BookingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface TimeSlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
}

export interface Experience {
  company: string;
  position: string;
  startYear: number;
  endYear: number | null;
  description: string;
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
}

// Prisma types with relations
export type UserWithExpertProfile = import('@prisma/client').Prisma.UserGetPayload<{
  include: { expertProfile: true }
}>;

export type ExpertProfileWithBookings = import('@prisma/client').Prisma.ExpertProfileGetPayload<{
  include: { bookings: true; user: true }
}>;

export type BookingWithRelations = import('@prisma/client').Prisma.BookingGetPayload<{
  include: { user: true; expert: { include: { user: true } } }
}>;

// Form data types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isExpert?: boolean;
}

export interface ExpertProfileFormData {
  title: string;
  bio: string;
  pricePerHour: number;
  isAvailable?: boolean;
  categories: string[];
  education?: Education[];
  experience?: Experience[];
  certifications?: Certification[];
}
