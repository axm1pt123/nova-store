'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth, useCart } from '@/lib/store';
import { fmtPrice } from '@/lib/price';
import { Category, PaginatedProducts, Product } from '@/types';

const WOMAN_SLUGS = ['mujer-ropa', 'mujer-accesorios', 'mujer-calzado'];
const MAN_SLUGS   = ['hombre-ropa', 'hombre-accesorios', 'hombre-calzado'];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();

  const urlSlug   = searchParams.get('slug') ?? '';
  const urlGender = searchParams.get('gender') ?? '';
  const urlOffers = searchParams.get('offers') === 'true';

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);

  useEffect(() => {
    api.get<Category[]>('/categories').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!categories.length) return;
    if (urlSlug) {
      const cat = categories.find((c) => c.slug === urlSlug);
      setActiveCatId(cat?.id ?? null);
    } else {
      setActiveCatId(null);
    }
  }, [categories, urlSlug]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('take', '100');
    if (activeCatId && !urlGender && !urlOffers) params.set('categoryId', activeCatId);
    api
      .get<PaginatedProducts>(`/products?${params.toString()}`)
      .then((r) => setAllProducts(r.items))
      .finally(() => setLoading(false));
  }, [activeCatId, urlGender, urlOffers]);

  const genderCatIds = (() => {
    if (!urlGender) return null;
    const slugs = urlGender === 'mujer' ? WOMAN_SLUGS : MAN_SLUGS;
    return categories.filter((c) => slugs.includes(c.slug)).map((c) => c.id);
  })();

  const visible = allProducts.filter((p) => {
    const matchGender  = !genderCatIds || genderCatIds.includes(p.categoryId);
    const matchOffers  = !urlOffers || (p.discountPercent != null && p.discountPercent > 0);
    const matchSearch  = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchGender && matchOffers && matchSearch;
  });

  const clearAll = () => { setActiveCatId(null); router.replace('/products'); };

  const selectCat = (catId: string | null, slug?: string) => {
    setActiveCatId(catId);
    router.replace(slug ? `/products?slug=${slug}` : '/products');
  };

  const selectGender = (gender: 'mujer' | 'hombre' | null) => {
    setActiveCatId(null);
    router.replace(gender ? `/products?gender=${gender}` : '/products');
  };

  const toggleOffers = () => {
    router.replace(urlOffers ? '/products' : '/products?offers=true');
  };

  async function handleAdd(e: React.MouseEvent, product: Product) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setFeedback('Iniciá sesión para agregar al carrito'); return; }
    try {
      await addItem(product.id, 1);
      setFeedback(`"${product.name}" agregado`);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Error');
    } finally {
      setTimeout(() => setFeedback(null), 3000);
    }
  }

  const activeLabel = (() => {
    if (urlOffers) return { text: '🏷️ Ofertas y descuentos', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
    if (urlGender === 'mujer') return { text: 'Colección Mujer', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
    if (urlGender === 'hombre') return { text: 'Colección Hombre', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    if (activeCatId) {
      const cat = categories.find((c) => c.id === activeCatId);
      const isWoman = WOMAN_SLUGS.includes(cat?.slug ?? '');
      return { text: cat?.name ?? '', color: isWoman ? 'text-rose-600' : 'text-blue-600', bg: isWoman ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200' };
    }
    return null;
  })();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Catálogo</p>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-4xl font-black text-brand">Productos</h1>
          {activeLabel && (
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${activeLabel.bg} ${activeLabel.color}`}>
              {activeLabel.text}
              <button onClick={clearAll} className="ml-1 opacity-60 hover:opacity-100">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input placeholder="Buscar productos..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10 max-w-sm" />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Todos */}
        <button
          onClick={clearAll}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all
            ${!urlGender && !activeCatId && !urlOffers ? 'bg-brand text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}
        >
          Todos
        </button>

        {/* Ofertas */}
        <button
          onClick={toggleOffers}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all
            ${urlOffers ? 'bg-rose-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-500'}`}
        >
          🏷️ Ofertas
        </button>

        {/* Mujer */}
        <button
          onClick={() => selectGender('mujer')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all
            ${urlGender === 'mujer' ? 'bg-rose-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-500'}`}
        >
          👗 Para ella
        </button>

        {/* Hombre */}
        <button
          onClick={() => selectGender('hombre')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all
            ${urlGender === 'hombre' ? 'bg-blue-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500'}`}
        >
          👔 Para él
        </button>

        <span className="h-5 w-px bg-gray-200" />

        {/* Category pills — filtradas por género si está activo */}
        {categories
          .filter((c) => {
            if (urlGender === 'mujer') return WOMAN_SLUGS.includes(c.slug);
            if (urlGender === 'hombre') return MAN_SLUGS.includes(c.slug);
            return true;
          })
          .map((c) => {
            const isActive = activeCatId === c.id && !urlOffers;
            const isWoman  = WOMAN_SLUGS.includes(c.slug);
            return (
              <button
                key={c.id}
                onClick={() => selectCat(isActive ? null : c.id, isActive ? undefined : c.slug)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all
                  ${isActive
                    ? isWoman ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {c.name}
              </button>
            );
          })}
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-sm text-gray-400 mb-6">
          {visible.length} producto{visible.length !== 1 ? 's' : ''}
          {urlOffers ? ' en oferta' : activeLabel ? ` en ${activeLabel.text}` : ''}
        </p>
      )}

      {feedback && (
        <div className="mb-5 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {feedback}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="rounded-2xl bg-gray-100 animate-pulse aspect-[3/4]" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-5xl mb-4">{urlOffers ? '🏷️' : '🔍'}</p>
          <p className="text-xl font-semibold text-brand mb-2">
            {urlOffers ? 'No hay productos en oferta ahora' : 'Sin resultados'}
          </p>
          <p className="text-gray-500 text-sm">
            {urlOffers ? 'Volvé pronto para ver nuevas promociones' : 'Intentá con otra búsqueda o categoría'}
          </p>
          <button onClick={clearAll} className="btn-primary mt-4">Ver todos los productos</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {visible.map((product) => {
            const hasDiscount = product.discountPercent != null && product.discountPercent > 0;
            const finalPrice  = hasDiscount ? product.priceDecimal * (1 - product.discountPercent! / 100) : product.priceDecimal;
            return (
              <Link key={product.id} href={`/products/${product.id}`} className="group overflow-hidden rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all duration-200 block">
                <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]">
                  {hasDiscount && (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold text-white">
                      -{product.discountPercent}%
                    </span>
                  )}
                  {!hasDiscount && product.stock <= 5 && product.stock > 0 && (
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
                    onClick={(e) => handleAdd(e, product)}
                    disabled={!product.isAvailable}
                    className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-brand line-clamp-1">{product.name}</p>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{product.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-base font-bold text-brand">{fmtPrice(finalPrice, product.currency)}</span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">{fmtPrice(product.priceDecimal, product.currency)}</span>
                    )}
                    {!product.isAvailable && <span className="text-xs text-red-500 font-medium ml-auto">Sin stock</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-gray-400">Cargando...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
