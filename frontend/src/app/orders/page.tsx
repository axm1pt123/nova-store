'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Order, OrderStatus } from '@/types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<Order[]>('/orders/my')
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <p>
        Inicia sesión para ver tus pedidos.{' '}
        <Link href="/login" className="text-brand-accent">
          Login
        </Link>
      </p>
    );
  }

  if (loading) return <p>Cargando pedidos...</p>;

  if (orders.length === 0) {
    return (
      <div className="text-center">
        <p>No tienes pedidos todavía.</p>
        <Link href="/products" className="btn-primary mt-4 inline-block">
          Comprar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis pedidos</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <article key={order.id} className="card p-4">
            <header className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500">#{order.id.slice(0, 8)}</p>
                <p className="text-sm">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${STATUS_STYLES[order.status]}`}
              >
                {order.status}
              </span>
            </header>
            <ul className="text-sm text-gray-700 space-y-1">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span>${item.subtotalDecimal.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <footer className="mt-3 pt-3 border-t flex justify-between">
              <span className="text-sm text-gray-600">Envío: {order.shippingAddress}</span>
              <span className="font-bold">${order.totalDecimal.toFixed(2)}</span>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
