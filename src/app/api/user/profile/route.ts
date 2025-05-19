import { NextResponse } from 'next/server';
import { verifyToken, getAuthToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import type { User } from '@/types/user';
import type { Expert } from '@/types/expert';

interface UserWithExpertProfile extends Omit<User, 'createdAt' | 'updatedAt'> {
  expertProfile?: Expert | null;
  createdAt: string;
  updatedAt: string;
}
import { serializeExpert } from '@/types/expert';
import { z } from 'zod';

// Schema for education items
const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startYear: z.number(),
  endYear: z.number(),
  expertId: z.string().optional()
});

// Schema for experience items
const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string(),
  position: z.string(),
  description: z.string(),
  startYear: z.number(),
  endYear: z.number().optional().nullable(),
  expertId: z.string().optional()
});

// Schema for certification items
const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  issuer: z.string(),
  // Remove issuingOrganization as it's not in the database schema
  // Keep issueDate for UI purposes but transform it to year in the database
  issueDate: z.string(),
  expertId: z.string().optional()
});

const updateProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  // Accept both URLs and local file paths for images, or null
  image: z.string().nullable().refine(
    (val) => val === null || val.startsWith('/uploads/') || val.startsWith('http'),
    { message: 'Image must be a valid URL, a local file path, or null' }
  ).optional(),
  bio: z.string().optional(),
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  // Expert specific fields
  title: z.string().optional(),
  categories: z.array(z.string()).optional(),
  pricePerHour: z.number().optional(),
  education: z.array(educationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  certifications: z.array(certificationSchema).optional()
});

export async function GET() {
  try {
    const token = await getAuthToken();
    console.log('Auth token:', token);
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    console.log('Token payload:', payload);

    if (!payload?.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userFromDb = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        expertProfile: {
          include: {
            education: true,
            experience: true,
            certifications: true,
            reviews: {
              include: {
                user: true
              }
            },
            availableTimeSlots: true,
            bookings: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!userFromDb) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Use type assertion to fix type issues
    const user = {
      ...userFromDb,
      createdAt: userFromDb.createdAt instanceof Date ? userFromDb.createdAt.toISOString() : userFromDb.createdAt,
      updatedAt: userFromDb.updatedAt instanceof Date ? userFromDb.updatedAt.toISOString() : userFromDb.updatedAt,
    } as unknown as UserWithExpertProfile;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Base user data that everyone can see
    const response: UserWithExpertProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      isExpert: user.isExpert,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Add expert profile data if the user is an expert
    if (user.isExpert && user.expertProfile) {
      const expertData = serializeExpert(user.expertProfile as Expert);
      response.expertProfile = expertData;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const token = await getAuthToken();
    const payload = token ? await verifyToken(token) : null;

    if (!payload?.userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    console.log('Received body:', body);
    
    // Parse the request body
    const { 
      firstName, lastName, image, bio, gender, dateOfBirth,
      // Expert specific fields
      title, categories, pricePerHour, education, experience, certifications 
    } = updateProfileSchema.parse(body);
    
    console.log('Parsed user data:', { firstName, lastName, image, bio, gender, dateOfBirth });
    console.log('Parsed expert data:', { title, categories, pricePerHour });

    // Create update data with careful handling of null/undefined values
    const updateData: any = {
      firstName,
      lastName,
    };
    
    // Handle image field (can be null or a string)
    if (image !== undefined) {
      updateData.image = image;
    }
    
    // Always include gender field, even if null
    updateData.gender = gender;
    
    // Handle dateOfBirth special case - convert string to Date object if not null
    if (dateOfBirth === null || dateOfBirth === undefined) {
      updateData.dateOfBirth = null;
    } else {
      // Convert the string date to a proper Date object
      try {
        updateData.dateOfBirth = new Date(dateOfBirth);
        console.log('Converted dateOfBirth to Date:', updateData.dateOfBirth);
      } catch (err) {
        console.error('Error converting dateOfBirth to Date:', err);
        updateData.dateOfBirth = null;
      }
    }
    
    console.log('Final update data:', updateData);

    // Check if we need to update expert profile
    console.log('Looking up user profile data for userId:', payload.userId);
    const userWithProfile = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        expertProfile: true
      }
    });
    console.log('Found user with profile?', !!userWithProfile, 'Is expert?', userWithProfile?.isExpert, 'Has expertProfile?', !!userWithProfile?.expertProfile);
    
    // Check if the user is an expert and has expert data to update
    const hasExpertData = (title !== undefined || 
                        categories !== undefined || 
                        pricePerHour !== undefined || 
                        education !== undefined || 
                        experience !== undefined || 
                        certifications !== undefined);
    console.log('Has expert data to update?', hasExpertData, 
                'Expert fields provided:', { title, categories, pricePerHour, 
                                             educationCount: education?.length, 
                                             experienceCount: experience?.length, 
                                             certificationsCount: certifications?.length });
    
    // Make sure expertProfile exists before trying to access it                                         
    if (userWithProfile?.isExpert && userWithProfile.expertProfile && hasExpertData) {
      // Store a reference to expertProfile ID to avoid null checks everywhere
      const expertProfileId = userWithProfile.expertProfile.id;
      console.log('Updating expert profile for expert user');
      
      // Expert data updates
      let expertUpdateData: any = {};
      
      if (title !== undefined) expertUpdateData.title = title;
      if (bio !== undefined) expertUpdateData.bio = bio;
      if (categories !== undefined) expertUpdateData.categories = categories;
      if (pricePerHour !== undefined) expertUpdateData.pricePerHour = pricePerHour;
      
      // First update the expert profile basic data
      if (Object.keys(expertUpdateData).length > 0) {
        await prisma.expertProfile.update({
          where: { userId: payload.userId },
          data: expertUpdateData
        });
      }
      
      // Handle education updates if provided
      if (education) {
        // Delete all existing education entries and recreate them
        await prisma.education.deleteMany({
          where: { expertId: expertProfileId }
        });
        
        // Create new education entries
        if (education.length > 0) {
          await prisma.education.createMany({
            data: education.map(edu => ({
              // Use school field which is what exists in the database schema
              // (our front-end uses 'institution' but DB uses 'school')
              school: edu.institution, 
              degree: edu.degree,
              field: edu.field,
              startYear: edu.startYear,
              endYear: edu.endYear,
              expertId: expertProfileId
            }))
          });
        }
      }
      
      // Handle experience updates if provided
      if (experience) {
        // Delete all existing experience entries and recreate them
        await prisma.experience.deleteMany({
          where: { expertId: expertProfileId }
        });
        
        // Create new experience entries
        if (experience.length > 0) {
          await prisma.experience.createMany({
            data: experience.map(exp => ({
              company: exp.company,
              position: exp.position,
              description: exp.description,
              startYear: exp.startYear,
              endYear: exp.endYear || null,
              expertId: expertProfileId
            }))
          });
        }
      }
      
      // Handle certification updates if provided
      if (certifications) {
        // Delete all existing certification entries and recreate them
        await prisma.certification.deleteMany({
          where: { expertId: expertProfileId }
        });
        
        // Create new certification entries
        if (certifications.length > 0) {
          await prisma.certification.createMany({
            data: certifications.map(cert => ({
              name: cert.name,
              issuer: cert.issuer, // Use issuer field from the form
              // Database doesn't have issuingOrganization or issueDate fields
              // Just use the year field which is in the database schema
              year: new Date(cert.issueDate).getFullYear(), 
              expertId: expertProfileId
            }))
          });
        }
      }
    }
    
    // Get updated user and convert dates to strings
    const updatedUserRaw = await prisma.user.update({
      where: { id: payload.userId },
      data: updateData,
      include: {
        expertProfile: {
          include: {
            education: true,
            experience: true,
            certifications: true,
            reviews: true,
            availableTimeSlots: true,
            bookings: {
              include: {
                user: true,
                expert: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    // Convert to UserWithExpertProfile with proper date handling
    const updatedUser = {
      ...updatedUserRaw,
      createdAt: updatedUserRaw.createdAt instanceof Date ? updatedUserRaw.createdAt.toISOString() : updatedUserRaw.createdAt,
      updatedAt: updatedUserRaw.updatedAt instanceof Date ? updatedUserRaw.updatedAt.toISOString() : updatedUserRaw.updatedAt,
    } as unknown as UserWithExpertProfile;

    // Base response for all users
    const response: any = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      image: updatedUser.image,
      gender: updatedUser.gender,
      dateOfBirth: updatedUser.dateOfBirth,
      isExpert: updatedUser.isExpert,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    // Add expert profile data if the user is an expert
    if (updatedUser.isExpert && updatedUser.expertProfile) {
      const expertData = serializeExpert(updatedUser.expertProfile as any);
      response.expertProfile = expertData;
    }

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    // Log the full error details including stack trace
    console.error('Error updating user profile:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Include the actual error message in the response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', message: errorMessage },
      { status: 500 }
    );
  }
}
