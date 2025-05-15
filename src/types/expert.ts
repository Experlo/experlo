import { type Booking } from './booking';
import { type SerializedUser } from './user';

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  expertId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  startYear: number;
  endYear?: number;
  expertId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: number;
  expertId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  expertId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  expertId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expert {
  id: string;
  userId: string;
  title: string;
  bio: string;
  pricePerHour: number;
  isAvailable: boolean;
  categories: string[];
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  totalBookings: number;
  totalConsultationMinutes: number;
  rating: number;
  reviews: Review[];
  availableTimeSlots: TimeSlot[];
  bookings: Booking[];
  user: SerializedUser;
  createdAt: string;
  updatedAt: string;
}

export interface ExpertProfileWithBookings extends Expert {}

export interface SerializedExpert {
  id: string;
  userId: string;
  user: SerializedUser;
  title: string;
  bio: string;
  pricePerHour: number;
  isAvailable: boolean;
  categories: string[];
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  totalBookings: number;
  totalConsultationMinutes: number;
  rating: number;
  reviews: Review[];
  availableTimeSlots: TimeSlot[];
  createdAt: string;
  updatedAt: string;
}

export function serializeExpert(expert: ExpertProfileWithBookings): SerializedExpert {
  return {
    id: expert.id,
    userId: expert.userId,
    user: expert.user,
    title: expert.title,
    bio: expert.bio,
    pricePerHour: expert.pricePerHour,
    isAvailable: expert.isAvailable,
    categories: expert.categories,
    education: expert.education,
    experience: expert.experience,
    certifications: expert.certifications,
    totalBookings: expert.totalBookings,
    totalConsultationMinutes: expert.totalConsultationMinutes,
    rating: expert.rating,
    reviews: expert.reviews,
    availableTimeSlots: expert.availableTimeSlots,
    createdAt: expert.createdAt,
    updatedAt: expert.updatedAt,
  };
};
