import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample users and experts
  const experts = [
    {
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      password: 'hashed_password',
      title: 'Financial Advisor',
      bio: 'Expert in personal finance and investment strategies',
      pricePerHour: 150,
      categories: ['Finance', 'Investment', 'Wealth Management'],
      rating: 4.9,
      totalBookings: 156,
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com',
      password: 'hashed_password',
      title: 'Tech Lead & Software Architect',
      bio: 'Experienced software architect specializing in scalable systems',
      pricePerHour: 200,
      categories: ['Software Development', 'System Design', 'Cloud Architecture'],
      rating: 4.8,
      totalBookings: 134,
    },
    {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael@example.com',
      password: 'hashed_password',
      title: 'Marketing Strategist',
      bio: 'Digital marketing expert with focus on growth strategies',
      pricePerHour: 175,
      categories: ['Marketing', 'Digital Strategy', 'Brand Development'],
      rating: 4.7,
      totalBookings: 98,
    },
    {
      firstName: 'Emily',
      lastName: 'Brown',
      email: 'emily@example.com',
      password: 'hashed_password',
      title: 'UX/UI Design Consultant',
      bio: 'Creating user-centered design solutions for digital products',
      pricePerHour: 165,
      categories: ['UX Design', 'UI Design', 'Product Design'],
      rating: 4.6,
      totalBookings: 112,
    },
  ];

  for (const expertData of experts) {
    const { firstName, lastName, email, password, ...expertProfileData } = expertData;

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password,
        isExpert: true,
      },
    });

    // Create expert profile
    await prisma.expertProfile.create({
      data: {
        userId: user.id,
        ...expertProfileData,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
