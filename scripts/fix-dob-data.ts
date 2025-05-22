import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to generate a random date between min and max years ago
function randomDateOfBirth(minYearsAgo: number, maxYearsAgo: number): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Generate random year within range
  const year = currentYear - Math.floor(Math.random() * (maxYearsAgo - minYearsAgo + 1) + minYearsAgo);
  
  // Generate random month (0-11)
  const month = Math.floor(Math.random() * 12);
  
  // Generate random day (1-28 to avoid invalid dates)
  const day = Math.floor(Math.random() * 28) + 1;
  
  return new Date(year, month, day);
}

// Generate a consistent date of birth based on user ID
// This ensures we get the same date each time for the same user
function generateConsistentDateOfBirth(userId: string): Date {
  // Use the user ID to seed a simple hash
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use the hash to derive age between 25 and 65
  const ageBase = Math.abs(hash) % 40; // 0-39
  const age = ageBase + 25; // 25-64
  
  // Get current year and subtract age
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  
  // Use hash to generate month and day
  const birthMonth = Math.abs(hash % 12);
  const birthDay = (Math.abs(hash % 28)) + 1; // 1-28
  
  return new Date(birthYear, birthMonth, birthDay);
}

async function main() {
  try {
    console.log('Starting date of birth fix...');
    
    // Get all users without a date of birth
    const users = await prisma.user.findMany({
      where: {
        dateOfBirth: null
      }
    });
    
    console.log(`Found ${users.length} users with missing date of birth`);
    
    let updatedCount = 0;
    let expertsCount = 0;
    
    for (const user of users) {
      // Generate a consistent date of birth based on user ID
      const dateOfBirth = generateConsistentDateOfBirth(user.id);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { dateOfBirth }
      });
      
      // Track if this was an expert
      if (user.isExpert) {
        expertsCount++;
      }
      
      console.log(`Updated user ${user.id}: ${user.firstName || 'No name'} ${user.lastName || ''} - Set DOB to ${dateOfBirth.toISOString().split('T')[0]}`);
      updatedCount++;
    }
    
    console.log('\nDate of birth fix summary:');
    console.log(`- Updated ${updatedCount} users with missing DOB`);
    console.log(`- Of these, ${expertsCount} were experts`);
    console.log('\nDate of birth fix completed successfully!');
  } catch (error) {
    console.error('Error fixing date of birth data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
