import { Metadata } from 'next';
import BecomeExpertForm from '@/features/profile/components/BecomeExpertForm';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export const metadata: Metadata = {
  title: 'Become an Expert | Experlo',
  description: 'Share your expertise and start earning by helping others on Experlo',
};

export default async function BecomeExpertPage({ searchParams }: Props) {
  const error = await Promise.resolve(searchParams?.error);

  // Mock user data
  const mockUser = {
    id: '1',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe'
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 bg-white border-b border-gray-200">
            <BecomeExpertForm error={error} user={mockUser} />
          </div>
        </div>
      </div>
    </div>
  );
}
