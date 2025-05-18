import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking users in database...');
    
    // Get all users
    const users = await prisma.user.findMany();
    
    console.log(`Found ${users.length} users in total`);
    
    if (users.length > 0) {
      // Count users with gender and dateOfBirth
      const usersWithGender = users.filter(user => user.gender !== null);
      const usersWithDOB = users.filter(user => user.dateOfBirth !== null);
      
      console.log(`Users with gender set: ${usersWithGender.length}`);
      console.log(`Users with dateOfBirth set: ${usersWithDOB.length}`);
      
      // Display user details
      console.log('\nUser details:');
      users.forEach((user, index) => {
        console.log(`\n[User ${index + 1}]`);
        console.log(`ID: ${user.id}`);
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Email: ${user.email}`);
        console.log(`Gender: ${user.gender || 'Not set'}`);
        console.log(`Date of Birth: ${user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : 'Not set'}`);
        console.log(`Is Expert: ${user.isExpert}`);
      });
    }
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
