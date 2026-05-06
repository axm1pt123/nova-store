'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { fmtPrice } from '@/lib/price';
import { Order, OrderStatus } from '@/types';

// Espeja las transiciones del backend (order-status.vo.ts)
const VALID_NEXT: Record<OrderStatus, OrderStatus[]> = {
  PENDING:              ['PENDING_VERIFICATION', 'CANCELLED'],
  PENDING_VERIFICATION: ['PAID', 'PENDING', 'CANCELLED'],
  PAID:                 ['SHIPPED', 'CANCELLED'],
  SHIPPED:              ['DELIVERED'],
  DELIVERED:            [],
  CANCELLED:            [],
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; style: string }> = {
  PENDING:              { label: 'Pendiente de pago',  style: 'bg-amber-100 text-amber-700' },
  PENDING_VERIFICATION: { label: 'Verificar comprobante', style: 'bg-blue-100 text-blue-700' },
  PAID:                 { label: 'Pagado',             style: 'bg-green-100 text-green-700' },
  SHIPPED:              { label: 'Enviado',            style: 'bg-indigo-100 text-indigo-700' },
  DELIVERED:            { label: 'Entregado',          style: 'bg-emerald-100 text-emerald-700' },
  CANCELLED:            { label: 'Cancelado',          style: 'bg-red-100 text-red-700' },
};

export default function AdminVentasPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [proofModal, setProofModal] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = () => {
    api.get<{ items: Order[] } | Order[]>('/orders?take=200')
      .then((res) => setOrders(Array.isArray(res) ? res : res.items ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user?.role === 'ADMIN') load(); }, [user]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleVerify = async (orderId: string, approve: boolean) => {
    setVerifying(orderId);
    try {
      await api.patch(`/orders/${orderId}/verify-payment`, { approve });
      showToast(approve ? '✅ Pago aprobado — orden marcada como Pagado' : '↩️ Comprobante rechazado — orden vuelve a Pendiente');
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error');
    } finally {
      setVerifying(null);
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await api.patch(`/orders/${orderId}/status`, { status });
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const printInvoice = (order: Order) => {
    const date = new Date(order.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' });
    const rows = order.items.map((item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${item.productName}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">${fmtPrice(item.unitPriceDecimal, order.currency)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">${fmtPrice(item.subtotalDecimal, order.currency)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
      <title>Factura #${order.id.slice(0, 8).toUpperCase()}</title>
      <style>
        body{font-family:system-ui,sans-serif;margin:0;padding:32px;color:#1a1a1a;font-size:14px}
        .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px}
        .brand{font-size:24px;font-weight:900;letter-spacing:-0.5px}
        .meta{text-align:right;color:#666;font-size:12px;line-height:1.8}
        h2{font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin:24px 0 8px}
        table{width:100%;border-collapse:collapse}
        th{padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#888;background:#f9f9f9;font-weight:700}
        th:nth-child(2){text-align:center}th:nth-child(3),th:nth-child(4){text-align:right}
        .total-row{display:flex;justify-content:flex-end;margin-top:16px}
        .total-box{background:#0f172a;color:#fff;border-radius:12px;padding:12px 24px;font-size:18px;font-weight:900}
        .status{display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#dcfce7;color:#166534}
        .address{color:#444;font-size:13px}
        @media print{body{padding:20px}}
      </style></head><body>
      <div class="header">
        <div>
          <div class="brand">NOVA Store</div>
          <div style="color:#888;font-size:12px;margin-top:4px">Comprobante de venta</div>
        </div>
        <div class="meta">
          <div><strong>Factura #${order.id.slice(0, 8).toUpperCase()}</strong></div>
          <div>Fecha: ${date}</div>
          <div>Estado: <span class="status">${STATUS_CONFIG[order.status].label}</span></div>
        </div>
      </div>
      <h2>Dirección de envío</h2>
      <p class="address">${order.shippingAddress}</p>
      <h2>Productos</h2>
      <table>
        <thead><tr>
          <th>Producto</th><th>Cant.</th><th>P. Unit.</th><th>Subtotal</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total-row">
        <div class="total-box">Total: ${fmtPrice(order.totalDecimal, order.currency)}</div>
      </div>
      <script>window.onload=()=>{window.print();}<\/script>
    </body></html>`;

    const win = window.open('', '_blank', 'width=800,height=600');
    if (win) { win.document.write(html); win.document.close(); }
  };

  if (user?.role !== 'ADMIN') return <div className="p-8"><p className="text-red-500">Acceso denegado.</p></div>;

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.shippingAddress.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = !filter || o.status === filter;
    return matchSearch && matchFilter;
  });

  const pendingCount = orders.filter((o) => o.status === 'PENDING_VERIFICATION').length;

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-brand text-white px-5 py-3 shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Proof modal */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setProofModal(null)}>
          <div className="relative max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={proofModal} alt="Comprobante" className="w-full rounded-2xl object-contain max-h-[80vh] bg-white" />
            <button onClick={() => setProofModal(null)}
              className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow text-gray-700 hover:bg-gray-100">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Panel Administrativo</p>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-brand">Ventas</h1>
        {pendingCount > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 px-4 py-1.5 text-sm font-bold">
            🔍 {pendingCount} comprobante{pendingCount !== 1 ? 's' : ''} por revisar
          </span>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total pedidos', value: orders.length.toString() },
          { label: 'Por verificar', value: orders.filter((o) => o.status === 'PENDING_VERIFICATION').length.toString() },
          { label: 'Pagados', value: orders.filter((o) => ['PAID', 'SHIPPED', 'DELIVERED'].includes(o.status)).length.toString() },
          { label: 'Ingresos', value: `Bs ${orders.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.totalDecimal, 0).toFixed(2)}` },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
            <p className="text-3xl font-black text-brand mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | '')} className="input sm:w-56">
          <option value="">Todos los estados</option>
          {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No hay ventas para mostrar.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Dirección</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Comprobante</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <>
                  <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${order.status === 'PENDING_VERIFICATION' ? 'bg-blue-50/40' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-brand font-semibold">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 max-w-[160px] truncate text-gray-600">{order.shippingAddress}</td>
                    <td className="px-6 py-4 text-right font-bold text-brand">{fmtPrice(order.totalDecimal, order.currency)}</td>
                    <td className="px-6 py-4">
                      <span className={`nova-badge text-xs ${STATUS_CONFIG[order.status].style}`}>
                        {STATUS_CONFIG[order.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.paymentProofUrl ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => setProofModal(order.paymentProofUrl!)}
                            className="flex items-center gap-1.5 rounded-lg bg-brand/10 hover:bg-brand/20 px-3 py-1.5 text-xs font-semibold text-brand transition-colors">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver
                          </button>
                          {order.status === 'PENDING_VERIFICATION' && (
                            <>
                              <button
                                onClick={() => handleVerify(order.id, true)}
                                disabled={verifying === order.id}
                                className="flex items-center gap-1 rounded-lg bg-green-500 hover:bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition-colors disabled:opacity-50"
                              >
                                ✓ Aprobar
                              </button>
                              <button
                                onClick={() => handleVerify(order.id, false)}
                                disabled={verifying === order.id}
                                className="flex items-center gap-1 rounded-lg bg-red-100 hover:bg-red-200 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors disabled:opacity-50"
                              >
                                ✗ Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                        <svg className={`h-4 w-4 text-gray-400 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  {expanded === order.id && (
                    <tr key={`${order.id}-detail`} className="bg-gray-50/80">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="rounded-xl bg-white border border-gray-100 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items del pedido</p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => printInvoice(order)}
                                className="flex items-center gap-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Imprimir factura
                              </button>
                              <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                className="input w-44 text-xs py-1.5"
                                disabled={VALID_NEXT[order.status].length === 0}>
                                <option value={order.status}>{STATUS_CONFIG[order.status].label} (actual)</option>
                                {VALID_NEXT[order.status].map((s) => (
                                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <table className="w-full text-sm">
                            <thead><tr className="text-left text-xs text-gray-400">
                              <th className="pb-2">Producto</th>
                              <th className="pb-2 text-center">Cant.</th>
                              <th className="pb-2 text-right">P.Unit</th>
                              <th className="pb-2 text-right">Subtotal</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-50">
                              {order.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="py-1.5 font-medium text-brand">{item.productName}</td>
                                  <td className="py-1.5 text-center text-gray-500">{item.quantity}</td>
                                  <td className="py-1.5 text-right text-gray-500">{fmtPrice(item.unitPriceDecimal, order.currency)}</td>
                                  <td className="py-1.5 text-right font-semibold">{fmtPrice(item.subtotalDecimal, order.currency)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                            <span className="text-gray-500 truncate max-w-sm">📍 {order.shippingAddress}</span>
                            <span className="font-black text-brand">{fmtPrice(order.totalDecimal, order.currency)}</span>
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
