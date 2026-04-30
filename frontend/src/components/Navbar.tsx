'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth, useCart } from '@/lib/store';
import { api } from '@/lib/api';
import { Category } from '@/types';
import { SearchModal } from './SearchModal';

// Grupos del mega menú
const NAV_GROUPS = [
  {
    label: 'Mujer',
    slugs: ['mujer-ropa', 'mujer-calzado', 'mujer-accesorios', 'ropa-mujer', 'calzado-mujer', 'accesorios-mujer'],
    keywords: ['mujer', 'ella', 'woman', 'female'],
    color: 'hover:text-rose-500',
    accent: 'bg-rose-500',
  },
  {
    label: 'Hombre',
    slugs: ['hombre-ropa', 'hombre-calzado', 'hombre-accesorios', 'ropa-hombre', 'calzado-hombre', 'accesorios-hombre'],
    keywords: ['hombre', 'el', 'man', 'male'],
    color: 'hover:text-blue-500',
    accent: 'bg-blue-500',
  },
  {
    label: 'Más',
    slugs: [],
    keywords: ['book', 'electronic', 'tech', 'accesorio', 'sport', 'deporte'],
    color: 'hover:text-brand',
    accent: 'bg-brand',
  },
];

function matchesGroup(cat: Category, group: typeof NAV_GROUPS[0]): boolean {
  const slug = cat.slug.toLowerCase();
  const name = cat.name.toLowerCase();
  if (group.slugs.some((s) => slug.includes(s.replace('-', '')))) return true;
  return group.keywords.some((k) => slug.includes(k) || name.includes(k));
}

export function Navbar() {
  const { user, loadProfile, logout } = useAuth();
  const { cart, refresh } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useEffect(() => { if (user) refresh(); }, [user, refresh]);
  useEffect(() => {
    api.get<Category[]>('/categories').then(setCategories).catch(() => {});
  }, []);

  const openMenu = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMenu(label);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 150);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <>
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Barra principal */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white text-sm font-bold">N</div>
          <span className="text-lg font-black tracking-tight text-brand">NOVA</span>
        </Link>

        {/* Nav principal */}
        <nav className="hidden md:flex items-stretch h-full">
          {NAV_GROUPS.map((group) => {
            const cats = categories.filter((c) => matchesGroup(c, group));
            return (
              <div
                key={group.label}
                className="relative flex items-center"
                onMouseEnter={() => cats.length > 0 && openMenu(group.label)}
                onMouseLeave={scheduleClose}
              >
                <button
                  className={`px-5 h-full text-sm font-semibold text-gray-700 ${group.color} transition-colors flex items-center gap-1`}
                >
                  {group.label}
                  {cats.length > 0 && (
                    <svg className={`h-3 w-3 transition-transform ${activeMenu === group.label ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}

          <Link href="/products?offers=true"
            className="px-5 h-full flex items-center text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors">
            🏷️ Ofertas
          </Link>
          <Link href="/products"
            className="px-5 h-full flex items-center text-sm font-semibold text-gray-500 hover:text-brand transition-colors">
            Ver todo
          </Link>
        </nav>

        {/* Iconos derecha */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            title="Buscar"
          >
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </button>

          {user ? (
            <div className="flex items-center gap-1">
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="hidden sm:block text-xs font-semibold text-brand hover:underline px-2">
                  Admin
                </Link>
              )}
              <Link href="/orders" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
                </svg>
              </Link>
              <button onClick={logout} className="hidden sm:block text-xs text-gray-500 hover:text-brand transition-colors px-2">
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

      {/* Mega menú desplegable */}
      {NAV_GROUPS.map((group) => {
        const cats = categories.filter((c) => matchesGroup(c, group));
        if (!cats.length) return null;
        return (
          <div
            key={group.label + '-menu'}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className={`absolute left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-40
              transition-all duration-200 origin-top
              ${activeMenu === group.label ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
          >
            <div className="mx-auto max-w-7xl px-6 py-8">
              <div className="grid grid-cols-4 gap-8">

                {/* Columna 1: Ver por categoría */}
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Ver por categoría
                  </p>
                  <ul className="space-y-2.5">
                    <li>
                      <Link
                        href={`/products?gender=${group.label === 'Mujer' ? 'mujer' : group.label === 'Hombre' ? 'hombre' : ''}`}
                        onClick={() => setActiveMenu(null)}
                        className="text-sm font-bold text-brand hover:underline"
                      >
                        Ver todo {group.label !== 'Más' ? group.label : ''}
                      </Link>
                    </li>
                    {cats.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          href={`/products?slug=${cat.slug}`}
                          onClick={() => setActiveMenu(null)}
                          className="text-sm text-gray-600 hover:text-brand hover:font-medium transition-colors"
                        >
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Columna 2: Destacados */}
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Destacados
                  </p>
                  <ul className="space-y-2.5">
                    <li>
                      <Link href="/products?offers=true" onClick={() => setActiveMenu(null)}
                        className="text-sm text-rose-500 font-semibold hover:underline">
                        🏷️ En oferta
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" onClick={() => setActiveMenu(null)}
                        className="text-sm text-gray-600 hover:text-brand transition-colors">
                        Novedades
                      </Link>
                    </li>
                    <li>
                      <Link href="/products" onClick={() => setActiveMenu(null)}
                        className="text-sm text-gray-600 hover:text-brand transition-colors">
                        Más vendidos
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Columna 3–4: Banner promocional */}
                <div className="col-span-2">
                  <Link
                    href={group.label === 'Mujer' ? '/products?gender=mujer' : group.label === 'Hombre' ? '/products?gender=hombre' : '/products'}
                    onClick={() => setActiveMenu(null)}
                    className="group block relative overflow-hidden rounded-2xl bg-gray-100 h-40"
                  >
                    <div className={`absolute inset-0 ${group.accent} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    <div className="absolute inset-0 flex flex-col items-start justify-end p-5">
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">
                        Colección
                      </p>
                      <p className="text-xl font-black text-brand">
                        {group.label !== 'Más' ? `Para ${group.label}` : 'Descubrí más'}
                      </p>
                      <span className="mt-2 text-xs font-semibold text-brand group-hover:underline">
                        Ver colección →
                      </span>
                    </div>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </header>

    <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
