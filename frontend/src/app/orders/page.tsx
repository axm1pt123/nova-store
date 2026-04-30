'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { fmtPrice } from '@/lib/price';
import { Order, OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; style: string; icon: string }> = {
  PENDING:              { label: 'Pendiente de pago',  style: 'bg-amber-100 text-amber-700',     icon: '⏳' },
  PENDING_VERIFICATION: { label: 'Verificando pago',   style: 'bg-blue-100 text-blue-700',       icon: '🔍' },
  PAID:                 { label: 'Pago confirmado',    style: 'bg-green-100 text-green-700',     icon: '✅' },
  SHIPPED:              { label: 'En camino',          style: 'bg-indigo-100 text-indigo-700',   icon: '📦' },
  DELIVERED:            { label: 'Entregado',          style: 'bg-emerald-100 text-emerald-700', icon: '🎉' },
  CANCELLED:            { label: 'Cancelado',          style: 'bg-red-100 text-red-700',         icon: '❌' },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get<Order[]>('/orders/my').then(setOrders).finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div className="text-center py-16">
      <p className="text-gray-500 mb-4">Iniciá sesión para ver tus pedidos.</p>
      <Link href="/login" className="btn-primary">Iniciar sesión</Link>
    </div>
  );

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-3xl mx-auto py-8">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-gray-100" />)}
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4">🛍️</p>
      <h2 className="text-xl font-bold text-brand mb-2">Todavía no tenés pedidos</h2>
      <p className="text-gray-500 mb-6">Explorá el catálogo y hacé tu primera compra.</p>
      <Link href="/products" className="btn-primary">Ver productos</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div>
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Mi cuenta</p>
        <h1 className="text-3xl font-black text-brand">Mis pedidos</h1>
      </div>

      {orders.map((order) => {
        const cfg = STATUS_CONFIG[order.status];
        return (
          <article key={order.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${cfg.style}`}>
                {cfg.icon} {cfg.label}
              </span>
            </div>

            <div className="px-6 py-4 space-y-2">
              {order.items.map((item) => (
                <div key={item.productName} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.quantity}× {item.productName}</span>
                  <span className="font-medium text-brand">{fmtPrice(item.subtotalDecimal, order.currency)}</span>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-lg font-black text-brand">{fmtPrice(order.totalDecimal, order.currency)}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {order.status === 'PENDING' && (
                  <Link href={`/pay/${order.id}`} className="btn-primary text-sm py-2 px-4">
                    💳 Pagar ahora
                  </Link>
                )}
                {order.status === 'PENDING_VERIFICATION' && (
                  <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2 text-sm text-blue-700">
                    <div className="h-3 w-3 rounded-full border-2 border-blue-300 border-t-blue-600 animate-spin" />
                    Revisando comprobante...
                  </div>
                )}
                {order.paymentProofUrl && (
                  <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer"
                    className="btn-outline text-sm py-2 px-4">
                    Ver comprobante
                  </a>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
