import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List of common female first names
const femaleNames = [
  'sarah', 'emily', 'lisa', 'anna', 'maria', 'katie', 'rouba', 
  'jennifer', 'jessica', 'amanda', 'ashley', 'elizabeth', 'stephanie', 
  'melissa', 'nicole', 'natalie', 'katherine', 'samantha', 'michelle',
  'rachel', 'laura', 'lauren', 'sophia', 'olivia', 'emma', 'ava', 'mia',
  'isabella', 'zoe', 'lily', 'emily', 'amelia', 'chloe', 'ella', 'natasha',
  'grace', 'hannah', 'victoria', 'charlotte'
];

// List of common male first names
const maleNames = [
  'john', 'michael', 'david', 'james', 'robert', 'william', 'joseph',
  'thomas', 'charles', 'daniel', 'matthew', 'anthony', 'mark', 'donald',
  'steven', 'paul', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian',
  'george', 'timothy', 'ronald', 'jason', 'edward', 'jeffrey', 'ryan',
  'richard', 'noah', 'liam', 'ethan', 'mason', 'logan', 'jacob'
];

async function main() {
  try {
    console.log('Starting gender data fix...');
    
    // Get all users
    const users = await prisma.user.findMany();
    
    console.log(`Found ${users.length} users in total`);
    
    let updatedFemaleCount = 0;
    let updatedMaleCount = 0;
    let normalizedCount = 0;
    let noGenderCount = 0;
    
    for (const user of users) {
      // CASE 1: Handle users with no gender at all
      if (user.gender === null) {
        noGenderCount++;
        
        // If we have a firstName, try to determine gender
        if (user.firstName) {
          const firstName = user.firstName.toLowerCase();
          
          // Check for female name
          if (femaleNames.some(name => firstName === name || firstName.startsWith(name))) {
            await prisma.user.update({
              where: { id: user.id },
              data: { gender: 'female' }
            });
            console.log(`Set gender for user ${user.id}: ${user.firstName} ${user.lastName || ''} - Set to female based on name`);
            updatedFemaleCount++;
            continue;
          }
          
          // Check for male name
          if (maleNames.some(name => firstName === name || firstName.startsWith(name))) {
            await prisma.user.update({
              where: { id: user.id },
              data: { gender: 'male' }
            });
            console.log(`Set gender for user ${user.id}: ${user.firstName} ${user.lastName || ''} - Set to male based on name`);
            updatedMaleCount++;
            continue;
          }
        }
        
        // Default to male if we can't determine (can be updated by user later)
        await prisma.user.update({
          where: { id: user.id },
          data: { gender: 'male' }
        });
        console.log(`Set default gender for user ${user.id}: ${user.firstName || 'No name'} ${user.lastName || ''} - Set to male as default`);
        updatedMaleCount++;
      }
      
      // CASE 2: Normalize gender values (ensure lowercase for consistency)
      else if (user.gender !== null && (user.gender !== 'male' && user.gender !== 'female')) {
        const normalizedGender = user.gender.toLowerCase() === 'female' ? 'female' : 'male';
        
        await prisma.user.update({
          where: { id: user.id },
          data: { gender: normalizedGender }
        });
        
        console.log(`Normalized gender for user ${user.id}: ${user.firstName || 'No name'} ${user.lastName || ''} - From "${user.gender}" to "${normalizedGender}"`);
        normalizedCount++;
      }
      
      // CASE 3: Fix inconsistencies based on name for users with gender already set
      else if (user.firstName && user.gender === 'male') {
        const firstName = user.firstName.toLowerCase();
        
        // Check if user has a distinctly female name but male gender
        if (femaleNames.some(name => firstName === name || firstName.startsWith(name)) && 
            !maleNames.some(name => firstName === name || firstName.startsWith(name))) {
          
          await prisma.user.update({
            where: { id: user.id },
            data: { gender: 'female' }
          });
          
          console.log(`Corrected gender for user ${user.id}: ${user.firstName} ${user.lastName || ''} - Changed from male to female`);
          updatedFemaleCount++;
        }
      }
    }
    
    console.log('\nGender data fix summary:');
    console.log(`- Set female gender for ${updatedFemaleCount} users`);
    console.log(`- Set male gender for ${updatedMaleCount} users`);
    console.log(`- Normalized gender format for ${normalizedCount} users`);
    console.log(`- Found ${noGenderCount} users with no gender initially`);
    console.log('\nGender data fix completed successfully!');
  } catch (error) {
    console.error('Error fixing gender data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
