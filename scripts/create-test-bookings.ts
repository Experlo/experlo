import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating test bookings...');

    // 1. Find users to work with
    const users = await prisma.user.findMany({
      include: {
        expertProfile: true,
      },
      take: 5, // Limit to first 5 users
    });

    if (users.length < 2) {
      throw new Error('Need at least 2 users (1 client, 1 expert) to create test bookings');
    }

    // Find an expert and a client
    const expertsWithProfiles = users.filter(user => user.isExpert && user.expertProfile !== null);
    const regularUsers = users.filter(user => !user.isExpert);

    if (expertsWithProfiles.length === 0) {
      throw new Error('No expert users found. Please create an expert user first.');
    }

    if (regularUsers.length === 0) {
      throw new Error('No regular users found. Please create a regular user first.');
    }

    const expert = expertsWithProfiles[0];
    const client = regularUsers[0];

    console.log(`Using expert: ${expert.firstName} ${expert.lastName} (ID: ${expert.id})`);
    console.log(`Using client: ${client.firstName} ${client.lastName} (ID: ${client.id})`);

    // 2. Create a booking for today (upcoming)
    const todayBooking = await prisma.booking.create({
      data: {
        userId: client.id,
        expertId: expert.expertProfile!.id,
        scheduledAt: new Date(Date.now() + 3600000), // 1 hour from now
        durationMinutes: 60,
        status: 'SCHEDULED',
      },
    });

    console.log('Created upcoming booking:', todayBooking);

    // 3. Create a booking for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2:00 PM

    const tomorrowBooking = await prisma.booking.create({
      data: {
        userId: client.id,
        expertId: expert.expertProfile!.id,
        scheduledAt: tomorrow,
        durationMinutes: 30,
        status: 'SCHEDULED',
      },
    });

    console.log('Created tomorrow booking:', tomorrowBooking);

    // 4. Create a past booking
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0); // 10:00 AM

    const pastBooking = await prisma.booking.create({
      data: {
        userId: client.id,
        expertId: expert.expertProfile!.id,
        scheduledAt: yesterday,
        durationMinutes: 45,
        status: 'COMPLETED',
      },
    });

    console.log('Created past booking:', pastBooking);

    console.log('Test bookings created successfully!');
  } catch (error) {
    console.error('Error creating test bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
