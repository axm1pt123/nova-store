'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: <GridIcon /> },
  { label: 'Productos', href: '/admin/products', icon: <BoxIcon /> },
  { label: 'Categorías', href: '/admin/categories', icon: <TagIcon /> },
  { label: 'Ventas', href: '/admin/ventas', icon: <ListIcon /> },
  { label: 'Usuarios', href: '/admin/users', icon: <UsersIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loadProfile, logout } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    loadProfile().finally(() => setChecked(true));
  }, [loadProfile]);

  useEffect(() => {
    if (!checked) return;
    if (!user || user.role !== 'ADMIN') {
      router.replace('/login');
    }
  }, [checked, user, router]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  if (!checked || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center bg-nova-dark">
        <div className="text-center">
          <div className="h-8 w-8 rounded-lg bg-white mx-auto mb-3 flex items-center justify-center text-nova-dark font-black text-sm">N</div>
          <p className="text-white/40 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'A';

  return (
    <div className="flex h-screen bg-nova-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col justify-between bg-nova-dark text-white flex-shrink-0">
        {/* Top: logo + nav */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-nova-dark text-sm font-black">
              N
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">NOVA Admin</p>
              <p className="text-[10px] text-white/40">v1.0</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="px-3 py-4 space-y-0.5">
            <p className="px-3 py-2 text-[10px] font-bold tracking-widest text-white/30 uppercase">Principal</p>
            {NAV.map((item) => {
              const active = item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/50 hover:bg-white/8 hover:text-white/80'
                  }`}
                >
                  <span className="opacity-70">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}

            <div className="pt-4">
              <p className="px-3 py-2 text-[10px] font-bold tracking-widest text-white/30 uppercase">Tienda</p>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/8 hover:text-white/80 transition-all"
              >
                <span className="opacity-70"><StoreIcon /></span>
                Ver tienda
                <svg className="h-3 w-3 ml-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom: user */}
        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-nova-blue text-white text-sm font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-white/40">{user?.role === 'ADMIN' ? 'Admin' : 'Usuario'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-white/40 hover:bg-white/8 hover:text-white/70 transition-all"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function GridIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM14 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6zM4 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2zM14 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2z" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A2 2 0 0 1 3 12V7a4 4 0 0 1 4-4z" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}
function StoreIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  );
}
