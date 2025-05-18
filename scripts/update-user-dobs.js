const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUserDOBs() {
  try {
    // Update Amer's DOB - 07/22/1985
    await prisma.user.updateMany({
      where: { firstName: 'Amer' },
      data: { dateOfBirth: new Date('1985-07-22') }
    });
    console.log('Updated Amer\'s DOB to 07/22/1985');

    // Update Joshua's DOB - 04/22/1984
    await prisma.user.updateMany({
      where: { firstName: 'Joshua' },
      data: { dateOfBirth: new Date('1984-04-22') }
    });
    console.log('Updated Joshua\'s DOB to 04/22/1984');

    // Update Rouba's DOB - 02/04/1988
    await prisma.user.updateMany({
      where: { firstName: 'Rouba' },
      data: { dateOfBirth: new Date('1988-02-04') }
    });
    console.log('Updated Rouba\'s DOB to 02/04/1988');

    // Update any other existing users to a default DOB (January 1, 1990)
    await prisma.user.updateMany({
      where: {
        dateOfBirth: null,
        NOT: [
          { firstName: 'Amer' },
          { firstName: 'Joshua' },
          { firstName: 'Rouba' }
        ]
      },
      data: { dateOfBirth: new Date('1990-01-01') }
    });
    console.log('Updated other users to default DOB (January 1, 1990)');

    console.log('All users\' DOBs updated successfully');
  } catch (error) {
    console.error('Error updating users\' DOBs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserDOBs();
