'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth, useCart } from '@/lib/store';

export function Navbar() {
  const { user, loadProfile, logout } = useAuth();
  const { cart, refresh } = useCart();

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useEffect(() => { if (user) refresh(); }, [user, refresh]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white text-sm font-bold">
            N
          </div>
          <span className="text-lg font-bold tracking-tight text-brand">NOVA</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/products" className="hover:text-brand transition-colors">Productos</Link>
          <Link href="/products" className="hover:text-brand transition-colors">Categorías</Link>
          <Link href="/products" className="hover:text-brand transition-colors">Ofertas</Link>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>

          {/* User */}
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="hidden sm:block text-xs font-medium text-nova-blue hover:underline">
                  Admin
                </Link>
              )}
              <Link href="/orders" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
                </svg>
              </Link>
              <button onClick={logout} className="hidden sm:block text-xs text-gray-500 hover:text-brand transition-colors">
                Salir
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
              </svg>
            </Link>
          )}

          {/* Cart */}
          <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
            {(cart?.itemCount ?? 0) > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                {cart!.itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
