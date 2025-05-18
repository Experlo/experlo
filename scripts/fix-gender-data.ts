import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List of common female first names
const femaleNames = [
  'sarah', 'emily', 'lisa', 'anna', 'maria', 'katie', 'rouba', 
  'jennifer', 'jessica', 'amanda', 'ashley', 'elizabeth', 'stephanie', 
  'melissa', 'nicole', 'natalie', 'katherine', 'samantha', 'michelle'
];

async function main() {
  try {
    console.log('Starting gender data fix...');
    
    // Get all users
    const users = await prisma.user.findMany();
    
    console.log(`Found ${users.length} users in total`);
    
    let updatedCount = 0;
    
    // Update users with female names but male gender
    for (const user of users) {
      const firstName = user.firstName.toLowerCase();
      
      // Check if the user has a female name but male gender
      const hasFemaleNameButMaleGender = 
        femaleNames.some(name => firstName.includes(name)) && 
        user.gender === 'male';
      
      if (hasFemaleNameButMaleGender) {
        await prisma.user.update({
          where: { id: user.id },
          data: { gender: 'female' }
        });
        
        console.log(`Updated user ${user.id}: ${user.firstName} ${user.lastName} - Gender changed from male to female`);
        updatedCount++;
      }
    }
    
    console.log(`Updated gender for ${updatedCount} users`);
    console.log('Gender data fix completed successfully!');
  } catch (error) {
    console.error('Error fixing gender data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
