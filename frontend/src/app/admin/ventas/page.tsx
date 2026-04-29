'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Order, OrderStatus } from '@/types';

const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  SHIPPED: 'Enviado',
  DELIVERED: 'Completada',
  CANCELLED: 'Cancelada',
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const PAGO_ICONS: Record<string, string> = {
  PENDING: '⏳',
  PAID: '💳',
  SHIPPED: '📦',
  DELIVERED: '✅',
  CANCELLED: '❌',
};

export default function AdminVentasPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    api.get<{ items: Order[] } | Order[]>('/orders?take=100')
      .then((res) => {
        setOrders(Array.isArray(res) ? res : res.items ?? []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8">
        <p className="text-red-500">Acceso denegado.</p>
      </div>
    );
  }

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = !filter || o.status === filter;
    return matchSearch && matchFilter;
  });

  const totalRevenue = filtered.reduce((s, o) => s + o.totalDecimal, 0);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    await api.patch(`/orders/${orderId}/status`, { status });
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Panel Administrativo</p>
      <h1 className="text-3xl font-black text-brand mb-8">Ventas</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ventas totales</p>
          <p className="text-4xl font-black text-brand mt-1">{orders.length}</p>
          <p className="text-xs text-gray-400 mt-1">Todas</p>
        </div>
        <div className="card p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingresos</p>
          <p className="text-4xl font-black text-brand mt-1">${orders.reduce((s, o) => s + o.totalDecimal, 0).toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">Acumulado</p>
        </div>
        <div className="card p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Promedio</p>
          <p className="text-4xl font-black text-brand mt-1">
            ${orders.length > 0 ? (orders.reduce((s, o) => s + o.totalDecimal, 0) / orders.length).toFixed(2) : '0.00'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Por venta</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            placeholder="Buscar por ID, cliente o producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as OrderStatus | '')}
          className="input sm:w-52"
        >
          <option value="">Todos los estados</option>
          {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} · Total ${totalRevenue.toFixed(2)}
        </span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No hay ventas para mostrar.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Productos</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <>
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-nova-blue font-semibold">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('es', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                      <span className="text-gray-400 ml-1 text-xs">
                        · {new Date(order.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-brand">{order.shippingAddress.slice(0, 24)}{order.shippingAddress.length > 24 ? '…' : ''}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {order.items.length} ítem{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-brand">
                      ${order.totalDecimal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`nova-badge ${STATUS_STYLE[order.status]}`}>
                        {STATUS_LABEL[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                        title="Ver detalle"
                      >
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {expanded === order.id && (
                    <tr key={`${order.id}-detail`} className="bg-gray-50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="rounded-xl bg-white border border-gray-100 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detalle del pedido</p>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className="input w-40 text-xs py-1.5"
                            >
                              {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => (
                                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                              ))}
                            </select>
                          </div>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-gray-400">
                                <th className="pb-2">Producto</th>
                                <th className="pb-2 text-center">Cantidad</th>
                                <th className="pb-2 text-right">Precio unit.</th>
                                <th className="pb-2 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {order.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="py-1.5 font-medium text-brand">{item.productName}</td>
                                  <td className="py-1.5 text-center text-gray-500">{item.quantity}</td>
                                  <td className="py-1.5 text-right text-gray-500">${item.unitPriceDecimal.toFixed(2)}</td>
                                  <td className="py-1.5 text-right font-semibold">${item.subtotalDecimal.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                            <span className="text-gray-500">Envío: {order.shippingAddress}</span>
                            <span className="font-black text-brand">${order.totalDecimal.toFixed(2)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
