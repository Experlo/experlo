# Experlo - Expert Learning Platform

Experlo is a modern web platform that connects learners with experts in various fields. The platform facilitates one-on-one learning sessions through video calls, allowing users to learn directly from experienced professionals.

## Features

### For Learners
- Browse and search for experts in various fields
- View detailed expert profiles with expertise areas, ratings, and pricing
- Schedule and manage learning sessions
- Real-time video calls with experts
- Secure payment processing

### For Experts
- Create and manage professional profiles
- Set availability and pricing
- Manage bookings and sessions
- Receive payments through secure channels

## Tech Stack

### Frontend
- Next.js with TypeScript
- Tailwind CSS for styling
- React Context for state management

### Backend
- Node.js with Express.js
- PostgreSQL with Prisma ORM
- WebRTC for video calling
- Socket.io for real-time communication

### Authentication & Payments
- NextAuth.js for authentication
- Stripe Connect for payment processing

## Project Structure

```
/src
  /app - Next.js app router pages
  /components - Reusable UI components
    /auth - Authentication components
    /video - Video call components
    /profile - Profile components
    /ui - Common UI elements
  /lib - Utility functions and configurations
    /db - Database configurations
    /api - API utilities
    /stripe - Stripe integration
  /types - TypeScript type definitions
  /styles - Global styles and Tailwind config
  /hooks - Custom React hooks
  /context - React context providers
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- Stripe account for payments

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Experlo/experlo.git
cd experlo
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
DATABASE_URL=your_postgresql_url
NEXTAUTH_SECRET=your_nextauth_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting

### Testing
```bash
npm run test        # Run unit tests
npm run test:e2e    # Run end-to-end tests
```

### Building for Production
```bash
npm run build
npm run start
```

## Deployment

The application can be deployed to various platforms:

1. Vercel (Recommended)
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy automatically with git push

2. Manual Deployment
   - Build the application
   - Set up environment variables
   - Start the Node.js server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@experlo.com or join our Slack community.
