import Header from '@/shared/components/ui/Header';

export default function BecomeExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {children}
      </main>
    </>
  );
}
