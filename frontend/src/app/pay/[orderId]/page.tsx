'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { fmtPrice } from '@/lib/price';
import { Order } from '@/types';

const API_URL     = process.env.NEXT_PUBLIC_API_URL     ?? 'http://localhost:3001/api/v1';
const BANK_QR_URL = process.env.NEXT_PUBLIC_BANK_QR_URL ?? '';
const BANK_NAME   = process.env.NEXT_PUBLIC_BANK_NAME   ?? 'Banco Mercantil Santa Cruz';
const BANK_HOLDER = process.env.NEXT_PUBLIC_BANK_HOLDER ?? 'NOVA Store SRL';
const BANK_ACCOUNT= process.env.NEXT_PUBLIC_BANK_ACCOUNT?? '1234567890';

export default function PayPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const router = useRouter();

  const [order, setOrder]           = useState<Order | null>(null);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [proofUrl, setProofUrl]     = useState('');
  const [preview, setPreview]       = useState<string | null>(null);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [tab, setTab]               = useState<'qr' | 'transfer'>('qr');
  const [copied, setCopied]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<Order>(`/orders/${orderId}`)
      .then(setOrder)
      .catch(() => router.replace('/orders'))
      .finally(() => setLoading(false));
  }, [orderId, router]);

  const uploadProof = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const token = localStorage.getItem('ecommerce_access_token');
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}` },
        body: fd,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.message ?? 'Error al subir imagen');
      setProofUrl(data.url);
      setPreview(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!proofUrl) { setError('Primero subí el comprobante de pago'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/orders/${orderId}/payment-proof`, { paymentProofUrl: proofUrl });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto animate-pulse space-y-4 py-12">
        <div className="h-8 w-48 bg-gray-100 rounded-xl" />
        <div className="h-80 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!order) return null;

  if (done || order.status === 'PENDING_VERIFICATION') {
    return (
      <div className="max-w-sm mx-auto py-20 text-center">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-green-100 mb-6">
          <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-brand mb-2">¡Comprobante enviado!</h1>
        <p className="text-gray-500 text-sm mb-8">
          Revisaremos tu comprobante y confirmaremos el pedido en breve.
        </p>
        <Link href="/orders" className="btn-primary">Ver mis pedidos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 space-y-5">

      {/* Header */}
      <div className="text-center">
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Paso final</p>
        <h1 className="text-2xl font-black text-brand">Escaneá y pagá</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pedido <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{order.id.slice(0, 8).toUpperCase()}</code>
        </p>
      </div>

      {/* Monto destacado */}
      <div className="rounded-2xl bg-brand text-white text-center py-5">
        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Total a pagar</p>
        <p className="text-4xl font-black">{fmtPrice(order.totalDecimal, order.currency)}</p>
        <p className="text-xs opacity-60 mt-1">
          {order.items.length} producto{order.items.length !== 1 ? 's' : ''} ·{' '}
          {order.items.map((i) => `${i.quantity}× ${i.productName}`).join(', ')}
        </p>
      </div>

      {/* Tabs de método de pago */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">

        {/* Selector de tab */}
        <div className="grid grid-cols-2 border-b border-gray-100">
          <button
            onClick={() => setTab('qr')}
            className={`flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors
              ${tab === 'qr'
                ? 'bg-brand text-white'
                : 'text-gray-400 hover:text-brand hover:bg-gray-50'}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Pagar con QR
          </button>
          <button
            onClick={() => setTab('transfer')}
            className={`flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-colors
              ${tab === 'transfer'
                ? 'bg-brand text-white'
                : 'text-gray-400 hover:text-brand hover:bg-gray-50'}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Transferencia
          </button>
        </div>

        {/* Contenido del tab */}
        <div className="p-6">

          {/* Tab QR */}
          {tab === 'qr' && (
            <div className="flex flex-col items-center gap-4">
              {BANK_QR_URL ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={BANK_QR_URL} alt="QR de pago"
                    className="h-56 w-56 object-contain rounded-xl border border-gray-100" />
                  <p className="text-xs text-gray-400 text-center leading-relaxed">
                    Abrí tu app bancaria → <strong>Pagos</strong> → <strong>Escanear QR</strong><br />
                    Verificá que el monto sea <strong>{fmtPrice(order.totalDecimal, order.currency)}</strong>
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                    <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-500">QR no configurado aún</p>
                  <p className="text-xs text-gray-400">
                    Agregá en <code className="bg-gray-100 px-1 rounded">.env.local</code>:<br />
                    <code className="text-brand text-xs">NEXT_PUBLIC_BANK_QR_URL=https://...</code>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab Transferencia */}
          {tab === 'transfer' && (
            <div className="space-y-3">
              <div className="rounded-xl bg-gray-50 px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Banco</p>
                  <p className="font-semibold text-brand text-sm">{BANK_NAME}</p>
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Titular</p>
                  <p className="font-semibold text-brand text-sm">{BANK_HOLDER}</p>
                </div>
              </div>
              <div className="rounded-xl bg-brand/5 border border-brand/20 px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Número de cuenta</p>
                  <p className="font-black text-2xl text-brand tracking-wider">{BANK_ACCOUNT}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(BANK_ACCOUNT); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-colors flex-shrink-0
                    ${copied ? 'bg-green-100 text-green-700' : 'bg-brand text-white hover:bg-brand/90'}`}
                >
                  {copied
                    ? <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copiado</>
                    : <><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copiar</>
                  }
                </button>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5 text-xs text-amber-700">
                Depositá exactamente <strong>{fmtPrice(order.totalDecimal, order.currency)}</strong> y subí el comprobante abajo.
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Subir comprobante */}
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-5 space-y-4">
        <p className="text-sm font-bold text-brand">📎 Subí tu comprobante</p>
        <p className="text-xs text-gray-500">
          Después de pagar tomá una captura de pantalla o foto del comprobante y subila aquí.
        </p>

        {preview ? (
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="comprobante" className="w-full max-h-52 object-contain rounded-xl border border-gray-200 bg-gray-50" />
            <button
              onClick={() => { setProofUrl(''); setPreview(null); }}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-brand py-8 flex flex-col items-center gap-2 text-gray-400 hover:text-brand transition-colors"
          >
            {uploading ? (
              <><div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-brand animate-spin" /><span className="text-sm">Subiendo...</span></>
            ) : (
              <>
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-medium">Subir comprobante</span>
                <span className="text-xs">JPG, PNG — máx. 5MB</span>
              </>
            )}
          </button>
        )}

        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadProof(f); e.target.value = ''; }} />

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!proofUrl || submitting || uploading}
          className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting
            ? <span className="flex items-center gap-2 justify-center"><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Enviando...</span>
            : 'Confirmar pago'}
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        ¿Problemas? <Link href="/orders" className="text-brand hover:underline">Ver mis pedidos</Link>
      </p>
    </div>
  );
}
