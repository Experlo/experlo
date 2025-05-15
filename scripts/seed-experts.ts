import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const experts = [
  {
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@example.com',
    title: 'AI Research Scientist',
    bio: 'PhD in Machine Learning with 8+ years of experience in deep learning and neural networks. Previously led AI research teams at Google Brain.',
    categories: ['Machine Learning', 'Deep Learning', 'Neural Networks'],
    pricePerHour: 200,
    education: [
      {
        degree: 'PhD in Computer Science',
        school: 'Stanford University',
        year: '2018'
      }
    ]
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    title: 'Computer Vision Expert',
    bio: 'Specialized in computer vision and image processing. Built multiple successful computer vision products used by millions.',
    categories: ['Computer Vision', 'Image Processing', 'Deep Learning'],
    pricePerHour: 180,
    education: [
      {
        degree: 'MS in Computer Vision',
        school: 'MIT',
        year: '2016'
      }
    ]
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    title: 'NLP Specialist',
    bio: 'Expert in Natural Language Processing and Large Language Models. Contributed to multiple open-source NLP libraries.',
    categories: ['NLP', 'Large Language Models', 'Text Analytics'],
    pricePerHour: 190,
    education: [
      {
        degree: 'PhD in Computational Linguistics',
        school: 'UC Berkeley',
        year: '2019'
      }
    ]
  },
  {
    name: 'Michael Chang',
    email: 'michael.chang@example.com',
    title: 'MLOps Engineer',
    bio: 'Specializing in ML infrastructure and deployment. Helped scale ML systems at Amazon and Netflix.',
    categories: ['MLOps', 'DevOps', 'Cloud Computing'],
    pricePerHour: 170,
    education: [
      {
        degree: 'MS in Software Engineering',
        school: 'Carnegie Mellon University',
        year: '2017'
      }
    ]
  },
  {
    name: 'Dr. Lisa Patel',
    email: 'lisa.patel@example.com',
    title: 'AI Ethics Researcher',
    bio: 'Focused on ethical AI development and responsible AI practices. Published author on AI ethics and bias mitigation.',
    categories: ['AI Ethics', 'Responsible AI', 'Bias in AI'],
    pricePerHour: 160,
    education: [
      {
        degree: 'PhD in AI Ethics',
        school: 'Oxford University',
        year: '2020'
      }
    ]
  },
  {
    name: 'Robert Kim',
    email: 'robert.kim@example.com',
    title: 'Robotics AI Expert',
    bio: 'Specialized in robotics and reinforcement learning. Built autonomous systems for Tesla and Boston Dynamics.',
    categories: ['Robotics', 'Reinforcement Learning', 'Control Systems'],
    pricePerHour: 210,
    education: [
      {
        degree: 'PhD in Robotics',
        school: 'Georgia Tech',
        year: '2016'
      }
    ]
  },
  {
    name: 'Anna Kowalski',
    email: 'anna.kowalski@example.com',
    title: 'AI Product Manager',
    bio: 'Expert in AI product development and strategy. Led AI initiatives at Microsoft and Meta.',
    categories: ['AI Product Management', 'AI Strategy', 'Technical Leadership'],
    pricePerHour: 150,
    education: [
      {
        degree: 'MBA',
        school: 'Harvard Business School',
        year: '2015'
      }
    ]
  },
  {
    name: 'David Singh',
    email: 'david.singh@example.com',
    title: 'AI Security Specialist',
    bio: 'Focused on AI security and adversarial machine learning. Previously led security teams at OpenAI.',
    categories: ['AI Security', 'Adversarial ML', 'Cybersecurity'],
    pricePerHour: 190,
    education: [
      {
        degree: 'MS in Computer Security',
        school: 'ETH Zurich',
        year: '2018'
      }
    ]
  },
  {
    name: 'Maria Gonzalez',
    email: 'maria.gonzalez@example.com',
    title: 'AI in Healthcare Expert',
    bio: 'Specialized in applying AI to healthcare problems. Developed medical imaging AI systems used in major hospitals.',
    categories: ['Healthcare AI', 'Medical Imaging', 'Biomedical ML'],
    pricePerHour: 200,
    education: [
      {
        degree: 'MD-PhD',
        school: 'Johns Hopkins University',
        year: '2017'
      }
    ]
  },
  {
    name: 'Thomas Anderson',
    email: 'thomas.anderson@example.com',
    title: 'AI Infrastructure Architect',
    bio: 'Expert in building and scaling AI infrastructure. Designed ML platforms used by Fortune 500 companies.',
    categories: ['AI Infrastructure', 'Distributed Systems', 'Cloud Architecture'],
    pricePerHour: 180,
    education: [
      {
        degree: 'MS in Distributed Systems',
        school: 'University of Washington',
        year: '2016'
      }
    ]
  }
];

async function main() {
  console.log('Starting to seed experts...');

  for (const expertData of experts) {
    const hashedPassword = await hash('Password123!', 12);
    
    // Create user first
    const user = await prisma.user.create({
      data: {
        email: expertData.email,
        password: hashedPassword,
        firstName: expertData.name.split(' ')[0],
        lastName: expertData.name.split(' ')[1],
        isExpert: true,
      },
    });

    // Create expert profile
    await prisma.expertProfile.create({
      data: {
        userId: user.id,
        title: expertData.title,
        bio: expertData.bio,
        pricePerHour: expertData.pricePerHour,
        isAvailable: true,
        categories: expertData.categories
      },
    });

    console.log(`Created expert: ${expertData.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding experts:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
