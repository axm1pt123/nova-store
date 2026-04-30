'use client';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  const isProductDetail = /^\/products\/[^/]+$/.test(pathname);

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Navbar />
      <main className={`mx-auto max-w-7xl px-6 ${isProductDetail ? 'py-4' : 'py-10'}`}>
        {children}
      </main>
    </>
  );
}
