'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface StoreConfig {
  bankName: string;
  bankHolder: string;
  bankAccount: string;
  qrImageUrl: string | null;
}

export default function ConfiguracionPagoPage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<StoreConfig>({
    bankName: '',
    bankHolder: '',
    bankAccount: '',
    qrImageUrl: null,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.get<StoreConfig>('/store-config')
      .then(setConfig)
      .finally(() => setLoading(false));
  }, []);

  const uploadQr = async (file: File) => {
    setUploading(true);
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
      setConfig((prev) => ({ ...prev, qrImageUrl: data.url }));
      showToast('QR actualizado — guardá los cambios para confirmar');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al subir', false);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/store-config', config);
      showToast('Configuración guardada correctamente');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al guardar', false);
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'ADMIN') return <div className="p-8"><p className="text-red-500">Acceso denegado.</p></div>;

  return (
    <div className="p-8 max-w-2xl">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-5 py-3 shadow-lg text-sm font-medium text-white ${toast.ok ? 'bg-brand' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Panel Administrativo</p>
      <h1 className="text-3xl font-black text-brand mb-8">Configuración de Pago</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Datos bancarios */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Datos Bancarios</h2>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre del banco</label>
              <input
                className="input"
                value={config.bankName}
                onChange={(e) => setConfig((p) => ({ ...p, bankName: e.target.value }))}
                placeholder="Banco Mercantil Santa Cruz"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Titular de la cuenta</label>
              <input
                className="input"
                value={config.bankHolder}
                onChange={(e) => setConfig((p) => ({ ...p, bankHolder: e.target.value }))}
                placeholder="NOVA Store SRL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Número de cuenta</label>
              <input
                className="input font-mono tracking-wider"
                value={config.bankAccount}
                onChange={(e) => setConfig((p) => ({ ...p, bankAccount: e.target.value }))}
                placeholder="1234567890"
              />
            </div>
          </div>

          {/* QR de pago */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">Código QR de Pago</h2>
            <p className="text-xs text-gray-400">
              Subí la imagen QR de tu banco para que los clientes puedan escanearla al momento de pagar.
            </p>

            {config.qrImageUrl ? (
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config.qrImageUrl}
                  alt="QR de pago"
                  className="h-40 w-40 object-contain rounded-xl border border-gray-200 bg-gray-50"
                />
                <div className="space-y-2">
                  <p className="text-sm text-green-600 font-semibold">QR cargado</p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="btn-secondary text-sm"
                  >
                    {uploading ? 'Subiendo...' : 'Cambiar QR'}
                  </button>
                  <button
                    onClick={() => setConfig((p) => ({ ...p, qrImageUrl: null }))}
                    className="block text-xs text-red-500 hover:underline"
                  >
                    Quitar QR
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-brand py-10 flex flex-col items-center gap-2 text-gray-400 hover:text-brand transition-colors"
              >
                {uploading ? (
                  <><div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-brand animate-spin" /><span className="text-sm">Subiendo...</span></>
                ) : (
                  <>
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span className="text-sm font-medium">Subir imagen QR</span>
                    <span className="text-xs">JPG, PNG — máx. 5MB</span>
                  </>
                )}
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadQr(f); e.target.value = ''; }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full py-3 text-base"
          >
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>
        </div>
      )}
    </div>
  );
}
