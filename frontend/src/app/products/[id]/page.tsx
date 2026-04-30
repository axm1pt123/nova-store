'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth, useCart } from '@/lib/store';
import { fmtPrice } from '@/lib/price';
import { Category, Product } from '@/types';

const PLACEHOLDER = 'https://placehold.co/800x1000/f3f4f6/9ca3af?text=NOVA';

export default function ProductDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const router     = useRouter();
  const { user }   = useAuth();
  const { addItem } = useCart();

  const [product, setProduct]     = useState<Product | null>(null);
  const [category, setCategory]   = useState<Category | null>(null);
  const [loading, setLoading]     = useState(true);
  const [qty, setQty]             = useState(1);
  const [adding, setAdding]       = useState(false);
  const [feedback, setFeedback]   = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    setActiveImg(0);
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
      .finally(() => { setAdding(false); setTimeout(() => setFeedback(null), 3500); });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[72px_3fr_2fr] gap-4 animate-pulse">
        <div className="hidden lg:flex flex-col gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-[72px] w-[72px] rounded-xl bg-gray-100" />)}
        </div>
        <div className="aspect-[3/4] rounded-2xl bg-gray-100" />
        <div className="space-y-4 pt-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-6 rounded-xl bg-gray-100" style={{ width: `${60 + i * 8}%` }} />)}
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasDiscount   = product.discountPercent != null && product.discountPercent > 0;
  const originalPrice = product.priceCents / 100;
  const finalPrice    = hasDiscount ? originalPrice * (1 - product.discountPercent! / 100) : originalPrice;
  const stockOk  = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const allImages     = product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : [PLACEHOLDER]);
  const cActive = Math.min(activeImg, allImages.length - 1);

  const prevImg = () => setActiveImg((i) => (i - 1 + allImages.length) % allImages.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % allImages.length);

  return (
    <>
      {/* Breadcrumb compacto */}
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-gray-400 flex-wrap">
        <Link href="/" className="hover:text-brand transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand transition-colors">Productos</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/products?slug=${category.slug}`} className="hover:text-brand transition-colors">{category.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-brand font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Grid que ocupa el resto de la pantalla sin scroll */}
      <div className="grid grid-cols-1 lg:grid-cols-[72px_3fr_2fr] gap-4 lg:gap-6
                      h-[calc(100vh-5.5rem)] overflow-hidden">

        {/* Thumbnails verticales — desktop */}
        {allImages.length > 1 ? (
          <div className="hidden lg:flex flex-col gap-2 overflow-y-auto max-h-[700px]">
            {allImages.map((url, i) => (
              <button key={url + i} onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 h-[72px] w-[72px] overflow-hidden rounded-xl border-2 transition-all
                  ${i === cActive ? 'border-brand' : 'border-gray-200 opacity-55 hover:opacity-100 hover:border-gray-300'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`foto ${i + 1}`} className="h-full w-full object-contain bg-gray-50" />
              </button>
            ))}
          </div>
        ) : (
          <div className="hidden lg:block" />
        )}

        {/* Imagen principal — click abre lightbox */}
        <div className="flex flex-col gap-3 h-full overflow-hidden">
          <div className="relative overflow-hidden rounded-2xl bg-gray-50 flex-1 min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={allImages[cActive]}
              src={allImages[cActive]}
              alt={product.name}
              className="w-full h-full object-contain"
              draggable={false}
            />

            {/* Badge descuento */}
            {hasDiscount && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-white shadow pointer-events-none">
                -{product.discountPercent}%
              </span>
            )}

            {/* Flechas de navegación entre fotos */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 hover:bg-white shadow-md transition-colors opacity-100"
                >
                  <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 hover:bg-white shadow-md transition-colors opacity-100"
                >
                  <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/40 px-2.5 py-0.5 text-xs font-medium text-white pointer-events-none">
                  {cActive + 1} / {allImages.length}
                </span>
              </>
            )}

            {/* Sin stock */}
            {!stockOk && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <span className="rounded-2xl bg-gray-900 px-6 py-3 text-sm font-bold text-white">Sin stock</span>
              </div>
            )}
          </div>

          {/* Thumbnails horizontales — mobile */}
          {allImages.length > 1 && (
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
              {allImages.map((url, i) => (
                <button key={url + i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 h-16 w-16 overflow-hidden rounded-xl border-2 transition-all
                    ${i === cActive ? 'border-brand' : 'border-gray-200 opacity-55 hover:opacity-100'}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`foto ${i + 1}`} className="h-full w-full object-contain bg-gray-50" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info del producto — scroll interno */}
        <div className="space-y-5 overflow-y-auto h-full pr-1">
          <div className="flex items-center gap-2 flex-wrap">
            {category && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">{category.name}</span>}
            {lowStock && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">⚠ Últimas {product.stock}</span>}
            {stockOk && !lowStock && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" /> En stock
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black text-brand leading-snug">{product.name}</h1>

          <div className="space-y-1.5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-black text-brand">{fmtPrice(finalPrice, product.currency)}</span>
              {hasDiscount && <span className="text-base text-gray-400 line-through">{fmtPrice(originalPrice, product.currency)}</span>}
            </div>
            {hasDiscount && (
              <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-700">
                -{product.discountPercent}% OFF
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>

          <div className="border-t border-gray-100" />

          {stockOk ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-brand">Cantidad</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                    <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                  </button>
                  <span className="w-8 text-center font-bold text-brand">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                    <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAdd} disabled={adding} className="btn-primary flex-1 py-3">
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
                <Link href="/cart" className="btn-outline py-3 px-4">Ver carrito</Link>
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
          ) : (
            <p className="text-red-500 font-semibold text-sm">Producto agotado</p>
          )}

          <div className="rounded-2xl bg-gray-50 p-4 space-y-2.5">
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
            </div>
          </div>

          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a productos
          </Link>
        </div>
      </div>
    </>
  );
}
