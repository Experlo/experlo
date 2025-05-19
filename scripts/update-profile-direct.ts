import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to update a user's profile directly in the database
async function updateUserProfile() {
  try {
    // Replace with your actual email
    const userEmail = 'roubashabou@gmail.com'; // ← CHANGE THIS TO YOUR EMAIL
    
    console.log(`Attempting to update profile for user with email: ${userEmail}`);
    
    // Find the user by email
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    
    if (!existingUser) {
      console.error(`User with email ${userEmail} not found.`);
      return;
    }
    
    console.log('Found user:', {
      id: existingUser.id,
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      gender: existingUser.gender,
      dateOfBirth: existingUser.dateOfBirth,
      dateOfBirthType: existingUser.dateOfBirth ? typeof existingUser.dateOfBirth : 'null',
    });
    
    // Create a proper JavaScript Date object
    const dobDate = new Date('1990-01-01');
    console.log('Using date value:', {
      dateObject: dobDate,
      isoString: dobDate.toISOString(),
      formattedDate: dobDate.toISOString().split('T')[0],
    });
    
    // Update the user directly in the database
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        // Set gender to 'male' or 'female'
        gender: 'female', // Change this as needed
        
        // Set dateOfBirth using proper DateTime format
        dateOfBirth: dobDate,
      },
    });
    
    console.log('Profile updated successfully:', {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      gender: updatedUser.gender,
      dateOfBirth: updatedUser.dateOfBirth,
      dateOfBirthType: updatedUser.dateOfBirth ? typeof updatedUser.dateOfBirth : 'null',
      dateOfBirthISOString: updatedUser.dateOfBirth ? updatedUser.dateOfBirth.toISOString() : 'null',
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
updateUserProfile();
