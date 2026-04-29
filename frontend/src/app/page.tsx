'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth, useCart } from '@/lib/store';
import { fmtPrice } from '@/lib/price';
import { Category, PaginatedProducts, Product } from '@/types';

const FEATURES = [
  { icon: '🚚', title: 'Envío gratis', sub: 'En compras superiores a $500' },
  { icon: '🛡️', title: 'Garantía 1 año', sub: 'En todos nuestros productos' },
  { icon: '🔄', title: 'Devoluciones', sub: '30 días para cambios' },
  { icon: '🎧', title: 'Soporte 24/7', sub: 'Atención personalizada' },
];

const WOMAN_SLUGS = ['mujer-ropa', 'mujer-accesorios', 'mujer-calzado'];
const MAN_SLUGS   = ['hombre-ropa', 'hombre-accesorios', 'hombre-calzado'];

export default function HomePage() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    api.get<PaginatedProducts>('/products?take=50').then((r) => setAllProducts(r.items)).catch(() => {});
    api.get<Category[]>('/categories').then(setCategories).catch(() => {});
  }, []);

  const getCatId = (slug: string) => categories.find((c) => c.slug === slug)?.id;

  const womanProducts = allProducts.filter((p) =>
    WOMAN_SLUGS.map(getCatId).filter(Boolean).includes(p.categoryId),
  ).slice(0, 4);

  const manProducts = allProducts.filter((p) =>
    MAN_SLUGS.map(getCatId).filter(Boolean).includes(p.categoryId),
  ).slice(0, 4);

  const hero = womanProducts[0] ?? allProducts[0] ?? null;

  function handleAdd(product: Product) {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) { setFeedback('Iniciá sesión para agregar al carrito'); return; }
      addItem(product.id, 1)
        .then(() => setFeedback(`"${product.name}" agregado`))
        .catch(() => setFeedback('Error al agregar'))
        .finally(() => setTimeout(() => setFeedback(null), 3000));
    };
  }

  return (
    <div className="space-y-24">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[540px]">
        <div className="space-y-7">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Nueva Colección 2026
          </span>
          <h1 className="text-6xl font-black tracking-tight leading-tight text-brand">
            Moda que<br />
            <span className="text-gray-300">te define.</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md">
            Descubrí las últimas tendencias en ropa, accesorios y calzado para mujer y hombre.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/products?gender=mujer" className="btn-primary gap-2">
              Colección Mujer
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/products?gender=hombre" className="btn-outline">
              Colección Hombre
            </Link>
          </div>
        </div>

        {hero && (
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl bg-gray-100 shadow-xl aspect-[4/5]">
              <span className="absolute right-4 top-4 z-10 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-brand text-white text-xs font-bold leading-tight">
                <span>-15%</span><span>OFF</span>
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.imageUrl ?? 'https://placehold.co/600x750/f3f4f6/9ca3af?text=NOVA'} alt={hero.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Destacado</p>
                  <p className="font-bold text-brand">{hero.name}</p>
                </div>
                <Link href="/products" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
            {/* Floating cards */}
            <div className="absolute -left-6 top-1/3 hidden lg:block">
              <div className="card p-3 shadow-lg w-36">
                <p className="text-xs text-gray-400">Esta semana</p>
                <p className="text-sm font-bold text-brand">+230 ventas</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-gray-100 py-8">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-center gap-3">
            <span className="text-2xl">{f.icon}</span>
            <div>
              <p className="text-sm font-semibold text-brand">{f.title}</p>
              <p className="text-xs text-gray-400">{f.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Sección Mujer ────────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-rose-400 uppercase mb-2">
              <span className="h-1.5 w-6 rounded-full bg-rose-400" />
              Para ella
            </span>
            <h2 className="text-4xl font-black text-brand">Colección Mujer</h2>
          </div>
          <Link href="/products?gender=mujer" className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-brand transition-colors">
            Ver todo
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Category pills mujer */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { label: 'Ropa Mujer', slug: 'mujer-ropa' },
            { label: 'Accesorios Mujer', slug: 'mujer-accesorios' },
            { label: 'Calzado Mujer', slug: 'mujer-calzado' },
          ].map(({ label, slug }) => (
            <Link key={slug} href={`/products?slug=${slug}`} className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 hover:border-rose-300 hover:text-rose-600 transition-all">
              {label}
            </Link>
          ))}
        </div>

        {feedback && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm text-white">{feedback}</div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {womanProducts.length > 0
            ? womanProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} discount={i === 0 ? 15 : 0} onAdd={handleAdd(p)} />
              ))
            : [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          }
        </div>
      </section>

      {/* ── Banner intermedio ────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-3xl bg-brand p-10 text-white min-h-[200px] flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-white/50 uppercase mb-1">Exclusivo</p>
            <h3 className="text-3xl font-black">Hasta 30% OFF<br />en accesorios</h3>
          </div>
          <Link href="/products?offers=true" className="inline-flex w-fit items-center gap-2 rounded-full bg-white text-brand px-5 py-2.5 text-sm font-semibold hover:bg-gray-100 transition-colors">
            Ver ofertas
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 p-10 text-white min-h-[200px] flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-white/40 uppercase mb-1">Nueva temporada</p>
            <h3 className="text-3xl font-black">Colección<br />Primavera 2026</h3>
          </div>
          <Link href="/products?gender=mujer&slug=mujer-ropa" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/10 transition-colors">
            Explorar
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Sección Hombre ───────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-blue-400 uppercase mb-2">
              <span className="h-1.5 w-6 rounded-full bg-blue-400" />
              Para él
            </span>
            <h2 className="text-4xl font-black text-brand">Colección Hombre</h2>
          </div>
          <Link href="/products?gender=hombre" className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-brand transition-colors">
            Ver todo
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Category pills hombre */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { label: 'Ropa Hombre', slug: 'hombre-ropa' },
            { label: 'Accesorios Hombre', slug: 'hombre-accesorios' },
            { label: 'Calzado Hombre', slug: 'hombre-calzado' },
          ].map(({ label, slug }) => (
            <Link key={slug} href={`/products?slug=${slug}`} className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all">
              {label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {manProducts.length > 0
            ? manProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} discount={i === 3 ? 10 : 0} onAdd={handleAdd(p)} />
              ))
            : [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          }
        </div>
      </section>

      {/* ── Categorías ───────────────────────────────────────── */}
      <section>
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">Explorar por sección</p>
          <h2 className="text-4xl font-black text-brand">Encuentra tu estilo</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Ropa Mujer',       slug: 'mujer-ropa',        emoji: '👗', bg: 'bg-rose-50',    text: 'text-rose-600',   border: 'hover:border-rose-200' },
            { label: 'Accesorios Mujer', slug: 'mujer-accesorios',  emoji: '👜', bg: 'bg-purple-50',  text: 'text-purple-600', border: 'hover:border-purple-200' },
            { label: 'Calzado Mujer',    slug: 'mujer-calzado',     emoji: '👠', bg: 'bg-pink-50',    text: 'text-pink-600',   border: 'hover:border-pink-200' },
            { label: 'Ropa Hombre',      slug: 'hombre-ropa',       emoji: '👔', bg: 'bg-blue-50',    text: 'text-blue-600',   border: 'hover:border-blue-200' },
            { label: 'Accesorios Hombre',slug: 'hombre-accesorios', emoji: '⌚', bg: 'bg-indigo-50',  text: 'text-indigo-600', border: 'hover:border-indigo-200' },
            { label: 'Calzado Hombre',   slug: 'hombre-calzado',    emoji: '👟', bg: 'bg-teal-50',    text: 'text-teal-600',   border: 'hover:border-teal-200' },
          ].map((cat) => (
            <Link
              key={cat.label}
              href={`/products?slug=${cat.slug}`}
              className={`card flex items-center gap-4 p-5 border border-transparent ${cat.border} transition-all hover:shadow-md`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${cat.bg} flex-shrink-0`}>
                {cat.emoji}
              </div>
              <span className={`font-semibold ${cat.text}`}>{cat.label}</span>
              <svg className="h-4 w-4 text-gray-300 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

function ProductCard({ product, discount, onAdd }: { product: Product; discount: number; onAdd: (e: React.MouseEvent) => void }) {
  const finalDecimal = discount > 0 ? product.priceDecimal * (1 - discount / 100) : product.priceDecimal;
  return (
    <Link href={`/products/${product.id}`} className="group overflow-hidden rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all duration-200 block">
      <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
        {discount > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white">
            Últimas {product.stock}
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl ?? 'https://placehold.co/400x533/f3f4f6/9ca3af?text=NOVA'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <button
          onClick={onAdd}
          disabled={!product.isAvailable}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-brand line-clamp-1">{product.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold text-brand">{fmtPrice(finalDecimal, product.currency)}</span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">{fmtPrice(product.priceDecimal, product.currency)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return <div className="rounded-2xl bg-gray-100 animate-pulse aspect-[3/4]" />;
}
