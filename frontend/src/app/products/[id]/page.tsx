'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth, useCart } from '@/lib/store';
import { Category, Product } from '@/types';

function fmtPrice(cents: number, currency: string) {
  const amount = (cents / 100).toFixed(2);
  return currency === 'BOB' ? `Bs ${amount}` : `$${amount}`;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Product>(`/products/${id}`)
      .then(async (p) => {
        setProduct(p);
        const cats = await api.get<Category[]>('/categories');
        setCategory(cats.find((c) => c.id === p.categoryId) ?? null);
      })
      .catch(() => router.replace('/products'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleAdd = () => {
    if (!user) { router.push('/login'); return; }
    if (!product) return;
    setAdding(true);
    addItem(product.id, qty)
      .then(() => setFeedback({ type: 'ok', msg: `${qty > 1 ? `${qty}x ` : ''}"${product.name}" agregado al carrito` }))
      .catch((err: unknown) => setFeedback({ type: 'err', msg: err instanceof Error ? err.message : 'Error' }))
      .finally(() => {
        setAdding(false);
        setTimeout(() => setFeedback(null), 3500);
      });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="aspect-square rounded-3xl bg-gray-100" />
        <div className="space-y-4 pt-4">
          <div className="h-5 w-24 rounded-full bg-gray-100" />
          <div className="h-10 w-3/4 rounded-xl bg-gray-100" />
          <div className="h-8 w-32 rounded-xl bg-gray-100" />
          <div className="h-32 rounded-xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const price = fmtPrice(product.priceCents, product.currency);
  const stockOk = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/" className="hover:text-brand transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand transition-colors">Productos</Link>
        {category && (
          <>
            <span>/</span>
            <span className="text-gray-500">{category.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-brand font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl bg-gray-50 aspect-square sticky top-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl ?? 'https://placehold.co/600x600/f3f4f6/9ca3af?text=NOVA'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {!stockOk && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-3xl">
                <span className="rounded-2xl bg-gray-900 px-6 py-3 text-sm font-bold text-white">Sin stock</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Category + stock */}
          <div className="flex items-center gap-3">
            {category && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                {category.name}
              </span>
            )}
            {lowStock && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                ⚠ Últimas {product.stock} unidades
              </span>
            )}
            {stockOk && !lowStock && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                En stock
              </span>
            )}
          </div>

          {/* Name */}
          <h1 className="text-4xl font-black text-brand leading-tight">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-brand">{price}</span>
            <span className="text-sm text-gray-400">{product.currency}</span>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Qty + add to cart */}
          {stockOk && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-brand">Cantidad</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-8 text-center font-bold text-brand">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className="btn-primary flex-1 py-3 text-base"
                >
                  {adding ? (
                    <span className="flex items-center gap-2 justify-center">
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Agregando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                      </svg>
                      Agregar al carrito
                    </span>
                  )}
                </button>
                <Link href="/cart" className="btn-outline py-3 px-5">
                  Ver carrito
                </Link>
              </div>

              {feedback && (
                <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium
                  ${feedback.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {feedback.type === 'ok'
                    ? <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    : <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                  }
                  {feedback.msg}
                </div>
              )}
            </div>
          )}

          {/* Details card */}
          <div className="rounded-2xl bg-gray-50 p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detalles</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">SKU</span>
                <code className="font-mono text-xs text-gray-600">{product.id.slice(0, 8).toUpperCase()}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Disponibilidad</span>
                <span className={stockOk ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                  {stockOk ? `${product.stock} en stock` : 'Agotado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Categoría</span>
                <span className="text-brand font-medium">{category?.name ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Moneda</span>
                <span className="text-brand font-medium">{product.currency}</span>
              </div>
            </div>
          </div>

          {/* Back link */}
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a productos
          </Link>
        </div>
      </div>
    </div>
  );
}
