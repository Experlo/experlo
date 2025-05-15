import Header from '@/shared/components/ui/Header';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-16">
        {children}
      </main>
    </>
  );
}
