const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUsers() {
  try {
    // Update Amer to male
    await prisma.user.updateMany({
      where: { firstName: 'Amer' },
      data: { gender: 'male' }
    });
    console.log('Updated Amer to male');

    // Update Joshua to male
    await prisma.user.updateMany({
      where: { firstName: 'Joshua' },
      data: { gender: 'male' }
    });
    console.log('Updated Joshua to male');

    // Update Rouba to female
    await prisma.user.updateMany({
      where: { firstName: 'Rouba' },
      data: { gender: 'female' }
    });
    console.log('Updated Rouba to female');

    // Update any other existing users to a default value
    await prisma.user.updateMany({
      where: {
        gender: null,
        NOT: [
          { firstName: 'Amer' },
          { firstName: 'Joshua' },
          { firstName: 'Rouba' }
        ]
      },
      data: { gender: 'male' }
    });
    console.log('Updated other users to default gender');

    console.log('All users updated successfully');
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUsers();
