import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting user data update...');
    
    // Get all users without gender or dateOfBirth
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { gender: null },
          { dateOfBirth: null }
        ]
      }
    });
    
    console.log(`Found ${users.length} users to update`);
    
    // Update each user with default values
    // We'll set males for users with even IDs and females for odd IDs as a simple distribution
    // And set a random birth date between 1980 and 2000
    for (const user of users) {
      const userId = user.id;
      const isEvenId = userId.charCodeAt(userId.length - 1) % 2 === 0;
      const gender = isEvenId ? 'male' : 'female';
      
      // Generate a random birth date between 1980 and 2000
      const year = Math.floor(Math.random() * (2000 - 1980 + 1)) + 1980;
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1; // Using 28 to avoid issues with February
      const dateOfBirth = new Date(year, month - 1, day);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          gender: (user as any).gender || gender,
          dateOfBirth: (user as any).dateOfBirth || dateOfBirth
        }
      });
      
      console.log(`Updated user ${user.id}: ${user.firstName} ${user.lastName} - Gender: ${gender}, DOB: ${dateOfBirth.toISOString().split('T')[0]}`);
    }
    
    console.log('User data update completed successfully!');
  } catch (error) {
    console.error('Error updating user data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
