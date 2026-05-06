'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth, useCart } from '@/lib/store';
import { fmtPrice } from '@/lib/price';
import { Order } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, refresh, updateItem, removeItem, clear } = useCart();
  const [shippingAddress, setShippingAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  if (!user) {
    return (
      <div className="text-center">
        <p>Necesitas iniciar sesión para ver tu carrito.</p>
        <Link href="/login" className="btn-primary mt-4 inline-block">
          Login
        </Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <Link href="/products" className="btn-primary mt-4 inline-block">
          Ver productos
        </Link>
      </div>
    );
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await api.post<Order>('/orders/checkout', { shippingAddress });
      router.push(`/pay/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el pedido');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-3">
        <h1 className="text-2xl font-bold">Carrito</h1>
        {cart.items.map((item) => (
          <div key={item.id} className="card p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm text-gray-700">Producto: {item.productId.slice(0, 8)}…</p>
              <p className="text-sm text-gray-500">
                {fmtPrice(item.unitPriceDecimal)} c/u
              </p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => updateItem(item.productId, parseInt(e.target.value, 10) || 1)}
              className="input w-20 mr-3"
            />
            <span className="font-bold w-20 text-right">
              {fmtPrice(item.subtotalDecimal)}
            </span>
            <button
              onClick={() => removeItem(item.productId)}
              className="ml-3 text-red-600 hover:underline text-sm"
            >
              Quitar
            </button>
          </div>
        ))}
        <button onClick={clear} className="btn-secondary text-sm">
          Vaciar carrito
        </button>
      </div>

      <aside className="card p-6 h-fit">
        <h2 className="font-semibold mb-4">Resumen</h2>
        <div className="flex justify-between mb-4 text-lg">
          <span>Total</span>
          <span className="font-bold">{fmtPrice(cart.totalDecimal)}</span>
        </div>
        <form onSubmit={handleCheckout} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Dirección de envío</label>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="input"
              rows={3}
              required
              minLength={5}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Procesando...' : 'Finalizar compra'}
          </button>
        </form>
      </aside>
    </div>
  );
}
