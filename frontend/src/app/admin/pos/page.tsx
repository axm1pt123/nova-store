'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { fmtPrice } from '@/lib/price';
import { Category, PaginatedProducts, Product } from '@/types';

interface SaleItem {
  product: Product;
  quantity: number;
}

const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'QR / Transferencia', 'Otro'];

export default function PosPage() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [search, setSearch]             = useState('');
  const [activeCat, setActiveCat]       = useState<string>('');
  const [sale, setSale]                 = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [submitting, setSubmitting]     = useState(false);
  const [receipt, setReceipt]           = useState<{ id: string; total: number; currency: string; items: SaleItem[] } | null>(null);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Category[]>('/categories'),
      api.get<PaginatedProducts>('/products?take=100'),
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods.items);
    });
  }, []);

  const visible = products.filter((p) => {
    if (!p.isAvailable) return false;
    const matchCat  = !activeCat || p.categoryId === activeCat;
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToSale = (product: Product) => {
    setSale((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setSale((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setSale((prev) =>
        prev.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i)
      );
    }
  };

  const removeItem = (productId: string) =>
    setSale((prev) => prev.filter((i) => i.product.id !== productId));

  const total = sale.reduce((sum, i) => sum + i.product.priceDecimal * i.quantity, 0);
  const currency = sale[0]?.product.currency ?? 'BOB';

  const handleSell = async () => {
    if (sale.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post<{ id: string; totalDecimal: number; currency: string }>(
        '/orders/pos',
        {
          items: sale.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          customerName: customerName || undefined,
          paymentMethod,
        },
      );
      setReceipt({ id: res.id, total: res.totalDecimal, currency: res.currency, items: [...sale] });
      setSale([]);
      setCustomerName('');
      // Actualizar stock en la lista local
      setProducts((prev) =>
        prev.map((p) => {
          const sold = sale.find((i) => i.product.id === p.id);
          return sold ? { ...p, stock: p.stock - sold.quantity } : p;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar venta');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Panel izquierdo: productos ── */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-gray-100 bg-gray-50">

        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Panel Admin</p>
              <h1 className="text-xl font-black text-brand">Punto de Venta</h1>
            </div>
            <span className="text-xs text-gray-400">{visible.length} productos disponibles</span>
          </div>

          {/* Buscador */}
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>

          {/* Filtro categorías */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCat('')}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors
                ${!activeCat ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              Todos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(activeCat === c.id ? '' : c.id)}
                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors
                  ${activeCat === c.id ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        <div className="flex-1 overflow-y-auto p-4">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm font-medium">Sin productos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {visible.map((p) => {
                const inSale = sale.find((i) => i.product.id === p.id);
                const lowStock = p.stock <= 5;
                return (
                  <button
                    key={p.id}
                    onClick={() => addToSale(p)}
                    className={`relative text-left rounded-2xl bg-white border-2 p-3 transition-all hover:shadow-md active:scale-95
                      ${inSale ? 'border-brand' : 'border-gray-100 hover:border-brand/40'}`}
                  >
                    {/* Imagen */}
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.imageUrl ?? 'https://placehold.co/200x200/f3f4f6/9ca3af?text=N'}
                        alt={p.name}
                        className="w-full h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/f3f4f6/9ca3af?text=N'; }}
                      />
                    </div>
                    <p className="text-xs font-bold text-brand line-clamp-2 mb-1">{p.name}</p>
                    <p className="text-sm font-black text-brand">{fmtPrice(p.priceDecimal, p.currency)}</p>
                    <p className={`text-[10px] mt-0.5 font-semibold ${lowStock ? 'text-amber-500' : 'text-gray-400'}`}>
                      Stock: {p.stock}
                    </p>
                    {inSale && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white text-[10px] font-black">
                        {inSale.quantity}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Panel derecho: venta actual ── */}
      <div className="flex flex-col w-80 xl:w-96 bg-white flex-shrink-0">

        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-black text-brand">Venta actual</h2>
          {sale.length > 0 && (
            <button onClick={() => setSale([])} className="text-xs text-red-400 hover:text-red-600 transition-colors mt-0.5">
              Limpiar todo
            </button>
          )}
        </div>

        {/* Items de la venta */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {sale.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2 py-12">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
              </svg>
              <p className="text-sm">Hacé click en un producto para agregarlo</p>
            </div>
          ) : (
            sale.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-brand truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-400">{fmtPrice(item.product.priceDecimal, item.product.currency)} c/u</p>
                </div>
                {/* Cantidad */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.product.id, item.quantity - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors text-sm font-bold"
                  >−</button>
                  <span className="w-6 text-center text-sm font-bold text-brand">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors text-sm font-bold disabled:opacity-30"
                  >+</button>
                </div>
                {/* Subtotal */}
                <div className="text-right w-16">
                  <p className="text-sm font-bold text-brand">{fmtPrice(item.product.priceDecimal * item.quantity, item.product.currency)}</p>
                </div>
                <button onClick={() => removeItem(item.product.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer: total + datos + cobrar */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-3">
          {/* Total */}
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-semibold text-gray-500">Total</span>
            <span className="text-2xl font-black text-brand">{fmtPrice(total, currency)}</span>
          </div>

          {/* Cliente y método de pago */}
          <input
            placeholder="Nombre del cliente (opcional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="input text-sm"
          />
          <div className="grid grid-cols-2 gap-1.5">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`rounded-xl py-2 text-xs font-semibold transition-colors
                  ${paymentMethod === m ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {m}
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <button
            onClick={handleSell}
            disabled={sale.length === 0 || submitting}
            className="btn-primary w-full py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Registrando...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cobrar {sale.length > 0 ? fmtPrice(total, currency) : ''}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Modal de comprobante / recibo ── */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-brand mb-1">¡Venta registrada!</h2>
            <p className="text-xs text-gray-400 font-mono mb-4">#{receipt.id.slice(0, 8).toUpperCase()}</p>

            <div className="rounded-2xl bg-gray-50 p-4 text-left space-y-2 mb-4">
              {receipt.items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity}× {item.product.name}</span>
                  <span className="font-semibold text-brand">{fmtPrice(item.product.priceDecimal * item.quantity, item.product.currency)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-base">
                <span>Total cobrado</span>
                <span className="text-brand">{fmtPrice(receipt.total, receipt.currency)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-5">El stock fue descontado automáticamente.</p>

            <button
              onClick={() => setReceipt(null)}
              className="btn-primary w-full"
            >
              Nueva venta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
