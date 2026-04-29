'use client';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </>
  );
}
