'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { fmtPrice } from '@/lib/price';
import { PaginatedProducts, Product } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PLACEHOLDER = 'https://placehold.co/80x80/f3f4f6/9ca3af?text=N';

export function SearchModal({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(-1);

  // Focus input al abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      setResults([]);
      setSelected(-1);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Búsqueda con debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setLoading(false); return; }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get<PaginatedProducts>(`/products?search=${encodeURIComponent(query)}&take=6`);
        setResults(res.items);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const goToProduct = (id: string) => {
    onClose();
    router.push(`/products/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, -1));
    } else if (e.key === 'Enter') {
      if (selected >= 0 && results[selected]) {
        goToProduct(results[selected].id);
      } else if (query.trim()) {
        onClose();
        router.push(`/products?search=${encodeURIComponent(query)}`);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white shadow-2xl w-full">
        {/* Input */}
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center gap-4">
          <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(-1); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar productos, categorías..."
            className="flex-1 text-lg font-medium text-brand placeholder-gray-300 outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
              className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button onClick={onClose}
            className="ml-1 text-sm font-medium text-gray-500 hover:text-brand transition-colors flex-shrink-0">
            Cancelar
          </button>
        </div>

        {/* Divisor */}
        <div className="border-t border-gray-100" />

        {/* Resultados */}
        {query.trim() ? (
          <div className="mx-auto max-w-3xl px-6 py-4 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-16 w-16 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="h-5 w-16 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
                </p>
                <ul className="space-y-1">
                  {results.map((p, i) => {
                    const hasDiscount = p.discountPercent != null && p.discountPercent > 0;
                    const finalPrice  = hasDiscount ? p.priceDecimal * (1 - p.discountPercent! / 100) : p.priceDecimal;
                    return (
                      <li key={p.id}>
                        <button
                          onClick={() => goToProduct(p.id)}
                          className={`w-full flex items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-colors
                            ${i === selected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                          {/* Imagen */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.imageUrl ?? PLACEHOLDER}
                            alt={p.name}
                            className="h-14 w-14 rounded-xl object-contain bg-gray-50 border border-gray-100 flex-shrink-0"
                          />
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-brand truncate">{p.name}</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{p.description}</p>
                            {!p.isAvailable && (
                              <span className="text-[10px] font-semibold text-red-400">Sin stock</span>
                            )}
                          </div>
                          {/* Precio */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-brand">{fmtPrice(finalPrice, p.currency)}</p>
                            {hasDiscount && (
                              <>
                                <p className="text-xs text-gray-400 line-through">{fmtPrice(p.priceDecimal, p.currency)}</p>
                                <span className="text-[10px] font-bold text-rose-500">-{p.discountPercent}%</span>
                              </>
                            )}
                          </div>
                          {/* Flecha */}
                          <svg className="h-4 w-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {/* Ver todos los resultados */}
                <button
                  onClick={() => { onClose(); router.push(`/products?search=${encodeURIComponent(query)}`); }}
                  className="mt-3 w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-brand hover:bg-gray-50 transition-colors"
                >
                  Ver todos los resultados para "{query}" →
                </button>
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-base font-semibold text-brand">Sin resultados para "{query}"</p>
                <p className="text-sm text-gray-400 mt-1">Intentá con otro término o revisá la ortografía</p>
              </div>
            )}
          </div>
        ) : (
          /* Estado vacío: búsquedas sugeridas */
          <div className="mx-auto max-w-3xl px-6 py-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sugerencias</p>
            <div className="flex flex-wrap gap-2">
              {['Zapatillas', 'Ropa mujer', 'Accesorios', 'Ofertas', 'Electrónica'].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:border-brand hover:text-brand transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
