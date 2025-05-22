import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Common password for all seed users
const PASSWORD = 'Password123!';

// Helper functions
const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomFloat = (min: number, max: number, decimals: number = 2) => {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
};

const getRandomRating = () => {
  // Weighted to favor higher ratings (4-5 stars)
  return getRandomFloat(3.5, 5.0);
};

const getRandomBookings = () => {
  return getRandomInt(5, 200);
};

async function seedExpert(expertData: any) {
  console.log(`Creating expert: ${expertData.firstName} ${expertData.lastName}`);
  
  // Hash the password
  const hashedPassword = await hash(PASSWORD, 10);
  
  // Create the user
  const user = await prisma.user.create({
    data: {
      email: expertData.email,
      firstName: expertData.firstName,
      lastName: expertData.lastName,
      password: hashedPassword,
      gender: expertData.gender,
      dateOfBirth: expertData.dateOfBirth,
      image: expertData.image,
      isExpert: true,
    },
  });

  // Calculate rating and bookings
  const rating = getRandomRating();
  const totalBookings = getRandomBookings();

  // Create the expert profile
  const expert = await prisma.expertProfile.create({
    data: {
      userId: user.id,
      title: expertData.title,
      bio: expertData.bio,
      pricePerHour: expertData.pricePerHour,
      categories: expertData.categories,
      totalBookings: totalBookings,
      rating: rating,
    },
  });

  // Add education
  for (const edu of expertData.education) {
    await prisma.education.create({
      data: {
        expertId: expert.id,
        school: edu.school,
        degree: edu.degree,
        field: edu.field,
        startYear: edu.startYear,
        endYear: edu.endYear,
      },
    });
  }

  // Add experience
  for (const exp of expertData.experience) {
    await prisma.experience.create({
      data: {
        expertId: expert.id,
        company: exp.company,
        position: exp.position,
        description: exp.description,
        startYear: exp.startYear,
        endYear: exp.endYear,
      },
    });
  }

  // Add certifications
  for (const cert of expertData.certifications) {
    await prisma.certification.create({
      data: {
        expertId: expert.id,
        name: cert.name,
        issuer: cert.issuer,
        year: cert.year,
      },
    });
  }

  // Add reviews
  const reviewCount = Math.min(totalBookings, 20); // Max 20 reviews
  for (let i = 0; i < reviewCount; i++) {
    // We'll need some users for the reviews - create them if necessary
    const reviewer = await prisma.user.findFirst({
      where: { email: `reviewer${i}@example.com` },
    }) || 
    await prisma.user.create({
      data: {
        email: `reviewer${i}@example.com`,
        firstName: `Reviewer`,
        lastName: `${i}`,
        password: hashedPassword,
      },
    });

    await prisma.review.create({
      data: {
        expertId: expert.id,
        userId: reviewer.id,
        rating: getRandomInt(3, 5), // Reviews tend to be positive
        comment: `Great session with ${expertData.firstName}! Highly recommended.`,
      },
    });
  }

  console.log(`✓ Created expert: ${expertData.firstName} ${expertData.lastName}`);
  return expert;
}

async function main() {
  console.log('Starting to seed diverse experts...');

  // Define expert data by category
  const diverseExperts = [
    // Medical Experts
    {
      firstName: 'Emma',
      lastName: 'Rodriguez',
      email: 'emma.rodriguez@example.com',
      gender: 'female',
      dateOfBirth: new Date('1980-03-15'),
      title: 'Cardiologist & Health Consultant',
      bio: 'Board-certified cardiologist with over 15 years of experience in cardiovascular health. I provide expert consultations on heart health, preventative care, and managing heart conditions.',
      pricePerHour: 250,
      categories: ['Medical', 'Cardiology', 'Health Consultation'],
      education: [
        {
          school: 'Johns Hopkins University',
          degree: 'MD',
          field: 'Medicine',
          startYear: 2000,
          endYear: 2004
        },
        {
          school: 'Harvard University',
          degree: 'BS',
          field: 'Biology',
          startYear: 1996,
          endYear: 2000
        }
      ],
      experience: [
        {
          company: 'Cleveland Clinic',
          position: 'Senior Cardiologist',
          description: 'Lead cardiologist providing expert care for complex cardiovascular conditions',
          startYear: 2012,
          endYear: null // current position
        },
        {
          company: 'Mayo Clinic',
          position: 'Cardiologist',
          description: 'Specialized in preventative cardiology and patient care',
          startYear: 2008,
          endYear: 2012
        }
      ],
      certifications: [
        {
          name: 'Board Certification in Cardiovascular Disease',
          issuer: 'American Board of Internal Medicine',
          year: 2010
        }
      ]
    },
    {
      firstName: 'Marcus',
      lastName: 'Chen',
      email: 'marcus.chen@example.com',
      gender: 'male',
      dateOfBirth: new Date('1975-09-22'),
      title: 'Psychiatrist & Mental Health Expert',
      bio: 'Experienced psychiatrist specializing in anxiety, depression, and stress management. I offer compassionate, evidence-based mental health consultations and guidance.',
      pricePerHour: 200,
      categories: ['Medical', 'Mental Health', 'Psychiatry'],
      education: [
        {
          school: 'Stanford University',
          degree: 'MD',
          field: 'Medicine',
          startYear: 1998,
          endYear: 2002
        }
      ],
      experience: [
        {
          company: 'Private Practice',
          position: 'Psychiatrist',
          description: 'Providing psychiatric evaluations, therapy, and medication management',
          startYear: 2010,
          endYear: null
        }
      ],
      certifications: [
        {
          name: 'Board Certification in Psychiatry',
          issuer: 'American Board of Psychiatry and Neurology',
          year: 2008
        }
      ]
    },

    // Legal Experts
    {
      firstName: 'David',
      lastName: 'Washington',
      email: 'david.washington@example.com',
      gender: 'male',
      dateOfBirth: new Date('1972-05-10'),
      title: 'Corporate Attorney & Legal Consultant',
      bio: 'Former partner at a top law firm with expertise in corporate law, mergers & acquisitions, and business contracts. I provide strategic legal advice to businesses of all sizes.',
      pricePerHour: 300,
      categories: ['Legal', 'Corporate Law', 'Business Law'],
      education: [
        {
          school: 'Yale Law School',
          degree: 'JD',
          field: 'Law',
          startYear: 1994,
          endYear: 1997
        }
      ],
      experience: [
        {
          company: 'Johnson & Smith LLP',
          position: 'Senior Partner',
          description: 'Led corporate legal transactions and managed major client relationships',
          startYear: 2005,
          endYear: 2020
        }
      ],
      certifications: [
        {
          name: 'Bar Admission',
          issuer: 'New York State Bar Association',
          year: 1997
        }
      ]
    },
    {
      firstName: 'Sophia',
      lastName: 'Garcia',
      email: 'sophia.garcia@example.com',
      gender: 'female',
      dateOfBirth: new Date('1982-11-17'),
      title: 'Immigration Attorney',
      bio: 'Specializing in immigration law, visa applications, and citizenship processes. I help individuals and families navigate the complex immigration system with care and expertise.',
      pricePerHour: 220,
      categories: ['Legal', 'Immigration Law', 'Visa Consulting'],
      education: [
        {
          school: 'Columbia Law School',
          degree: 'JD',
          field: 'Law',
          startYear: 2004,
          endYear: 2007
        }
      ],
      experience: [
        {
          company: 'Garcia Immigration Law',
          position: 'Founder & Attorney',
          description: 'Providing comprehensive immigration services and advocacy',
          startYear: 2012,
          endYear: null
        }
      ],
      certifications: [
        {
          name: 'Bar Admission',
          issuer: 'California State Bar Association',
          year: 2007
        }
      ]
    },

    // Finance Experts
    {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@example.com',
      gender: 'male',
      dateOfBirth: new Date('1975-06-29'),
      title: 'Investment Strategist & Financial Advisor',
      bio: 'Former Wall Street analyst with expertise in investment management, portfolio optimization, and retirement planning. I help clients build wealth through strategic financial planning.',
      pricePerHour: 275,
      categories: ['Finance', 'Investment Strategy', 'Wealth Management'],
      education: [
        {
          school: 'University of Pennsylvania',
          degree: 'MBA',
          field: 'Finance',
          startYear: 1998,
          endYear: 2000
        }
      ],
      experience: [
        {
          company: 'Goldman Sachs',
          position: 'Senior Investment Strategist',
          description: 'Developed investment strategies for high-net-worth clients',
          startYear: 2002,
          endYear: 2015
        }
      ],
      certifications: [
        {
          name: 'Certified Financial Planner (CFP)',
          issuer: 'CFP Board',
          year: 2005
        }
      ]
    },
    {
      firstName: 'Aisha',
      lastName: 'Patel',
      email: 'aisha.patel@example.com',
      gender: 'female',
      dateOfBirth: new Date('1985-02-12'),
      title: 'Tax Expert & Financial Consultant',
      bio: 'Specialized in tax planning, compliance, and optimization strategies for individuals and businesses. I help clients minimize tax liability while staying compliant with tax laws.',
      pricePerHour: 180,
      categories: ['Finance', 'Tax Planning', 'Financial Consulting'],
      education: [
        {
          school: 'New York University',
          degree: 'MS',
          field: 'Taxation',
          startYear: 2008,
          endYear: 2010
        }
      ],
      experience: [
        {
          company: 'Deloitte',
          position: 'Tax Manager',
          description: 'Managed tax strategy and compliance for corporate clients',
          startYear: 2010,
          endYear: 2018
        }
      ],
      certifications: [
        {
          name: 'Certified Public Accountant (CPA)',
          issuer: 'AICPA',
          year: 2011
        }
      ]
    },

    // Technology Experts
    {
      firstName: 'Ryan',
      lastName: 'Kim',
      email: 'ryan.kim@example.com',
      gender: 'male',
      dateOfBirth: new Date('1988-04-05'),
      title: 'Software Architect & Tech Lead',
      bio: 'Experienced software architect specializing in distributed systems, cloud architecture, and scalable applications. I help companies build robust, efficient technical infrastructure.',
      pricePerHour: 195,
      categories: ['Technology', 'Software Architecture', 'Cloud Computing'],
      education: [
        {
          school: 'MIT',
          degree: 'MS',
          field: 'Computer Science',
          startYear: 2009,
          endYear: 2011
        }
      ],
      experience: [
        {
          company: 'Amazon Web Services',
          position: 'Principal Solutions Architect',
          description: 'Designed scalable cloud architecture solutions for enterprise clients',
          startYear: 2015,
          endYear: 2022
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect - Professional',
          issuer: 'Amazon Web Services',
          year: 2016
        }
      ]
    },
    {
      firstName: 'Olivia',
      lastName: 'Martinez',
      email: 'olivia.martinez@example.com',
      gender: 'female',
      dateOfBirth: new Date('1990-08-19'),
      title: 'Cybersecurity Specialist',
      bio: 'Expert in information security, threat prevention, and data protection. I help organizations strengthen their security posture and implement robust security practices.',
      pricePerHour: 210,
      categories: ['Technology', 'Cybersecurity', 'Information Security'],
      education: [
        {
          school: 'Carnegie Mellon University',
          degree: 'MS',
          field: 'Information Security',
          startYear: 2012,
          endYear: 2014
        }
      ],
      experience: [
        {
          company: 'Microsoft',
          position: 'Senior Security Engineer',
          description: 'Led security initiatives and vulnerability assessments',
          startYear: 2016,
          endYear: 2022
        }
      ],
      certifications: [
        {
          name: 'Certified Information Systems Security Professional (CISSP)',
          issuer: '(ISC)²',
          year: 2017
        }
      ]
    },

    // Business & Management Experts
    {
      firstName: 'Michael',
      lastName: 'Thompson',
      email: 'michael.thompson@example.com',
      gender: 'male',
      dateOfBirth: new Date('1970-12-03'),
      title: 'Business Strategy Consultant',
      bio: 'Former management consultant with expertise in business strategy, operational excellence, and organizational transformation. I help businesses optimize performance and drive growth.',
      pricePerHour: 260,
      categories: ['Business', 'Strategy', 'Management Consulting'],
      education: [
        {
          school: 'Harvard Business School',
          degree: 'MBA',
          field: 'Business Administration',
          startYear: 1994,
          endYear: 1996
        }
      ],
      experience: [
        {
          company: 'McKinsey & Company',
          position: 'Senior Partner',
          description: 'Led strategic consulting engagements for Fortune 500 clients',
          startYear: 2000,
          endYear: 2018
        }
      ],
      certifications: [
        {
          name: 'Certified Management Consultant (CMC)',
          issuer: 'Institute of Management Consultants',
          year: 2002
        }
      ]
    },
    {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@example.com',
      gender: 'female',
      dateOfBirth: new Date('1983-07-25'),
      title: 'HR & Talent Development Expert',
      bio: 'Specializing in human resources, organizational development, and talent management. I help companies build effective HR strategies and develop high-performing teams.',
      pricePerHour: 185,
      categories: ['Business', 'Human Resources', 'Organizational Development'],
      education: [
        {
          school: 'Cornell University',
          degree: 'MS',
          field: 'Human Resource Management',
          startYear: 2005,
          endYear: 2007
        }
      ],
      experience: [
        {
          company: 'PepsiCo',
          position: 'Global HR Director',
          description: 'Led HR initiatives across multiple regions and business units',
          startYear: 2012,
          endYear: 2020
        }
      ],
      certifications: [
        {
          name: 'Senior Professional in Human Resources (SPHR)',
          issuer: 'HR Certification Institute',
          year: 2010
        }
      ]
    },

    // Marketing & Creative Experts
    {
      firstName: 'Jonathan',
      lastName: 'Lee',
      email: 'jonathan.lee@example.com',
      gender: 'male',
      dateOfBirth: new Date('1986-09-14'),
      title: 'Digital Marketing Strategist',
      bio: 'Expert in digital marketing, growth strategies, and performance marketing. I help businesses leverage digital channels to acquire customers and drive revenue growth.',
      pricePerHour: 190,
      categories: ['Marketing', 'Digital Strategy', 'Growth Marketing'],
      education: [
        {
          school: 'Northwestern University',
          degree: 'MBA',
          field: 'Marketing',
          startYear: 2008,
          endYear: 2010
        }
      ],
      experience: [
        {
          company: 'Google',
          position: 'Marketing Lead',
          description: 'Developed digital marketing strategies for enterprise clients',
          startYear: 2014,
          endYear: 2019
        }
      ],
      certifications: [
        {
          name: 'Google Ads Certification',
          issuer: 'Google',
          year: 2015
        }
      ]
    },
    {
      firstName: 'Zoe',
      lastName: 'Bennett',
      email: 'zoe.bennett@example.com',
      gender: 'female',
      dateOfBirth: new Date('1989-01-30'),
      title: 'UX/UI Design Consultant',
      bio: 'Specialized in user experience design, interface design, and product development. I help companies create intuitive, engaging digital experiences that users love.',
      pricePerHour: 175,
      categories: ['Design', 'UX/UI', 'Product Design'],
      education: [
        {
          school: 'Rhode Island School of Design',
          degree: 'BFA',
          field: 'Graphic Design',
          startYear: 2007,
          endYear: 2011
        }
      ],
      experience: [
        {
          company: 'Airbnb',
          position: 'Senior UX Designer',
          description: 'Led user experience design for key product initiatives',
          startYear: 2015,
          endYear: 2020
        }
      ],
      certifications: [
        {
          name: 'Certified User Experience Professional',
          issuer: 'Nielsen Norman Group',
          year: 2016
        }
      ]
    },

    // Education & Teaching Experts
    {
      firstName: 'Samuel',
      lastName: 'Jackson',
      email: 'samuel.jackson@example.com',
      gender: 'male',
      dateOfBirth: new Date('1968-07-12'),
      title: 'Education Consultant & Academic Advisor',
      bio: 'Former university professor with expertise in higher education, academic planning, and college admissions. I help students navigate the education system and achieve their academic goals.',
      pricePerHour: 150,
      categories: ['Education', 'Academic Advising', 'College Admissions'],
      education: [
        {
          school: 'Columbia University',
          degree: 'PhD',
          field: 'Education Policy',
          startYear: 1995,
          endYear: 2000
        }
      ],
      experience: [
        {
          company: 'Princeton University',
          position: 'Professor of Education',
          description: 'Taught graduate-level courses in education policy and leadership',
          startYear: 2002,
          endYear: 2018
        }
      ],
      certifications: [
        {
          name: 'Independent Educational Consultant Certificate',
          issuer: 'Independent Educational Consultants Association',
          year: 2019
        }
      ]
    },
    {
      firstName: 'Maria',
      lastName: 'Gonzalez',
      email: 'maria.gonzalez@example.com',
      gender: 'female',
      dateOfBirth: new Date('1978-04-09'),
      title: 'Language Learning Expert & ESL Specialist',
      bio: 'Specialized in language acquisition, ESL teaching methods, and multilingual education. I help language learners achieve fluency and teachers develop effective language instruction.',
      pricePerHour: 120,
      categories: ['Education', 'Language Learning', 'ESL'],
      education: [
        {
          school: 'University of Barcelona',
          degree: 'MA',
          field: 'Applied Linguistics',
          startYear: 2000,
          endYear: 2002
        }
      ],
      experience: [
        {
          company: 'International Language Institute',
          position: 'Director of Curriculum',
          description: 'Developed language learning programs and trained ESL instructors',
          startYear: 2008,
          endYear: 2019
        }
      ],
      certifications: [
        {
          name: 'TESOL Certification',
          issuer: 'TESOL International Association',
          year: 2003
        }
      ]
    },

    // Science & Research Experts
    {
      firstName: 'Thomas',
      lastName: 'Mitchell',
      email: 'thomas.mitchell@example.com',
      gender: 'male',
      dateOfBirth: new Date('1972-03-28'),
      title: 'Environmental Scientist & Sustainability Consultant',
      bio: 'PhD environmental scientist specializing in climate change, sustainability, and environmental impact assessment. I help organizations develop environmentally responsible practices.',
      pricePerHour: 200,
      categories: ['Science', 'Environment', 'Sustainability'],
      education: [
        {
          school: 'University of California, Berkeley',
          degree: 'PhD',
          field: 'Environmental Science',
          startYear: 1996,
          endYear: 2001
        }
      ],
      experience: [
        {
          company: 'Environmental Defense Fund',
          position: 'Senior Scientist',
          description: 'Led research initiatives on climate change and ecosystems',
          startYear: 2005,
          endYear: 2015
        }
      ],
      certifications: [
        {
          name: 'Certified Environmental Professional',
          issuer: 'Academy of Board Certified Environmental Professionals',
          year: 2007
        }
      ]
    },
    {
      firstName: 'Rebecca',
      lastName: 'Johnson',
      email: 'rebecca.johnson@example.com',
      gender: 'female',
      dateOfBirth: new Date('1980-11-05'),
      title: 'Data Scientist & Research Methodologist',
      bio: 'Expert in data analysis, research design, and statistical methods. I help researchers and organizations make sense of complex data and draw meaningful insights.',
      pricePerHour: 215,
      categories: ['Science', 'Data Science', 'Research Methods'],
      education: [
        {
          school: 'Duke University',
          degree: 'PhD',
          field: 'Statistics',
          startYear: 2003,
          endYear: 2008
        }
      ],
      experience: [
        {
          company: 'IBM Research',
          position: 'Principal Data Scientist',
          description: 'Led advanced analytics projects and research initiatives',
          startYear: 2010,
          endYear: 2019
        }
      ],
      certifications: [
        {
          name: 'Certified Data Scientist',
          issuer: 'Data Science Council of America',
          year: 2012
        }
      ]
    },

    // Health & Wellness Experts
    {
      firstName: 'Nicole',
      lastName: 'Williams',
      email: 'nicole.williams@example.com',
      gender: 'female',
      dateOfBirth: new Date('1982-06-15'),
      title: 'Nutritionist & Wellness Coach',
      bio: 'Registered dietitian specializing in nutritional therapy, weight management, and holistic wellness. I help clients achieve their health goals through personalized nutrition plans.',
      pricePerHour: 140,
      categories: ['Health', 'Nutrition', 'Wellness'],
      education: [
        {
          school: 'Tufts University',
          degree: 'MS',
          field: 'Nutrition Science',
          startYear: 2004,
          endYear: 2006
        }
      ],
      experience: [
        {
          company: 'Wellness Center of Boston',
          position: 'Lead Nutritionist',
          description: 'Provided nutritional counseling and developed wellness programs',
          startYear: 2009,
          endYear: 2018
        }
      ],
      certifications: [
        {
          name: 'Registered Dietitian Nutritionist (RDN)',
          issuer: 'Commission on Dietetic Registration',
          year: 2007
        }
      ]
    },
    {
      firstName: 'Daniel',
      lastName: 'Taylor',
      email: 'daniel.taylor@example.com',
      gender: 'male',
      dateOfBirth: new Date('1984-10-22'),
      title: 'Fitness Expert & Personal Trainer',
      bio: 'Certified strength and conditioning specialist with expertise in exercise science, athletic performance, and fitness programming. I help clients optimize their physical performance and health.',
      pricePerHour: 125,
      categories: ['Health', 'Fitness', 'Athletic Performance'],
      education: [
        {
          school: 'University of Southern California',
          degree: 'BS',
          field: 'Exercise Science',
          startYear: 2003,
          endYear: 2007
        }
      ],
      experience: [
        {
          company: 'Elite Performance Center',
          position: 'Head Performance Coach',
          description: 'Designed training programs for professional athletes and fitness enthusiasts',
          startYear: 2012,
          endYear: null
        }
      ],
      certifications: [
        {
          name: 'Certified Strength and Conditioning Specialist (CSCS)',
          issuer: 'National Strength and Conditioning Association',
          year: 2009
        }
      ]
    },

    // Arts & Culture Experts
    {
      firstName: 'Claire',
      lastName: 'Anderson',
      email: 'claire.anderson@example.com',
      gender: 'female',
      dateOfBirth: new Date('1975-08-17'),
      title: 'Art Historian & Cultural Consultant',
      bio: 'PhD art historian specializing in contemporary art, art markets, and cultural property. I provide expert guidance on art acquisition, collection management, and cultural heritage.',
      pricePerHour: 165,
      categories: ['Arts', 'Art History', 'Cultural Consulting'],
      education: [
        {
          school: 'NYU Institute of Fine Arts',
          degree: 'PhD',
          field: 'Art History',
          startYear: 1998,
          endYear: 2003
        }
      ],
      experience: [
        {
          company: 'Metropolitan Museum of Art',
          position: 'Curator of Contemporary Art',
          description: 'Curated major exhibitions and managed museum collections',
          startYear: 2007,
          endYear: 2016
        }
      ],
      certifications: [
        {
          name: 'Certified Appraiser of Fine Art',
          issuer: 'International Society of Appraisers',
          year: 2010
        }
      ]
    },
    {
      firstName: 'Robert',
      lastName: 'Foster',
      email: 'robert.foster@example.com',
      gender: 'male',
      dateOfBirth: new Date('1979-02-09'),
      title: 'Music Producer & Industry Consultant',
      bio: 'Grammy-winning music producer with expertise in music production, industry trends, and artist development. I help musicians navigate the music industry and create compelling work.',
      pricePerHour: 170,
      categories: ['Arts', 'Music', 'Entertainment'],
      education: [
        {
          school: 'Berklee College of Music',
          degree: 'BM',
          field: 'Music Production',
          startYear: 1997,
          endYear: 2001
        }
      ],
      experience: [
        {
          company: 'Atlantic Records',
          position: 'Executive Producer',
          description: 'Produced albums for major recording artists and developed talent',
          startYear: 2008,
          endYear: 2017
        }
      ],
      certifications: [
        {
          name: 'Certified Audio Engineer',
          issuer: 'Audio Engineering Society',
          year: 2004
        }
      ]
    }
  ];

  // Seed all experts
  for (const expertData of diverseExperts) {
    await seedExpert(expertData);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding diverse experts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
