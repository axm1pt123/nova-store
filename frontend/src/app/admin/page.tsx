'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar,
} from 'recharts';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';

interface SalesPoint { date: string; ordersCount: number; totalDecimal: number }
interface TopProduct { productId: string; productName: string; unitsSold: number; revenueDecimal: number }
interface FrequentCustomer { userId: string; fullName: string; email: string; ordersCount: number; totalSpentDecimal: number }

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<SalesPoint[]>([]);
  const [top, setTop] = useState<TopProduct[]>([]);
  const [customers, setCustomers] = useState<FrequentCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    Promise.all([
      api.get<SalesPoint[]>('/reports/sales-by-date'),
      api.get<TopProduct[]>('/reports/top-products?limit=5'),
      api.get<FrequentCustomer[]>('/reports/frequent-customers?limit=5'),
    ])
      .then(([s, t, c]) => { setSales(s); setTop(t); setCustomers(c); })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <AdminShell title="Dashboard"><p className="text-white/50 text-sm">Iniciá sesión.</p></AdminShell>;
  if (user.role !== 'ADMIN') return <AdminShell title="Dashboard"><p className="text-red-400 text-sm">Acceso denegado.</p></AdminShell>;
  if (loading) return <AdminShell title="Dashboard"><LoadingSkeleton /></AdminShell>;

  const totalRevenue = sales.reduce((s, r) => s + r.totalDecimal, 0);
  const totalOrders = sales.reduce((s, r) => s + r.ordersCount, 0);
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <AdminShell title="Dashboard">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard label="Ventas totales" value={totalOrders.toString()} sub="Todos los pedidos" icon="📦" />
        <KpiCard label="Ingresos" value={`$${totalRevenue.toFixed(2)}`} sub="Acumulado" icon="💰" />
        <KpiCard label="Ticket promedio" value={`$${avgTicket.toFixed(2)}`} sub="Por venta" icon="📊" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="font-semibold text-brand mb-5">Ventas por día</h2>
          {sales.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="totalDecimal" name="Ventas $" stroke="#0f172a" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ordersCount" name="Pedidos" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-brand mb-5">Top 5 productos</h2>
          {top.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={top} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="productName" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip />
                <Bar dataKey="unitsSold" name="Unidades" fill="#0f172a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Clientes frecuentes + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-brand">Clientes frecuentes</h2>
          </div>
          {customers.length === 0 ? (
            <Empty />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3 text-center">Pedidos</th>
                  <th className="pb-3 text-right">Total gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => (
                  <tr key={c.userId}>
                    <td className="py-3 font-medium text-brand">{c.fullName}</td>
                    <td className="py-3 text-gray-500">{c.email}</td>
                    <td className="py-3 text-center">{c.ordersCount}</td>
                    <td className="py-3 text-right font-semibold">${c.totalSpentDecimal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-3">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-brand mb-3">Acciones rápidas</h3>
            <div className="space-y-2">
              <Link href="/admin/products" className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors text-sm text-brand font-medium">
                <span className="text-lg">📦</span> Gestionar productos
              </Link>
              <Link href="/admin/ventas" className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors text-sm text-brand font-medium">
                <span className="text-lg">📋</span> Ver ventas
              </Link>
              <Link href="/" className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors text-sm text-brand font-medium">
                <span className="text-lg">🛍️</span> Ir a la tienda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-8">
      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Panel Administrativo</p>
      <h1 className="text-3xl font-black text-brand mb-8">{title}</h1>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: string }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-brand mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-gray-400 py-8 text-center">Sin datos todavía.</p>;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />)}
      </div>
      <div className="h-56 rounded-2xl bg-gray-100 animate-pulse" />
    </div>
  );
}
