'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { fmtPrice } from '@/lib/price';
import { Category, PaginatedProducts, Product } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
const PAGE_SIZE = 10;

interface ProductForm {
  name: string; description: string; price: string;
  stock: string; categoryId: string; imageUrl: string;
  discountPercent: string; isActive: boolean;
}
const EMPTY: ProductForm = {
  name: '', description: '', price: '', stock: '',
  categoryId: '', imageUrl: '', discountPercent: '', isActive: true,
};

function formFromProduct(p: Product): ProductForm {
  return {
    name: p.name, description: p.description,
    price: p.priceDecimal.toFixed(2), stock: p.stock.toString(),
    categoryId: p.categoryId, imageUrl: p.imageUrl ?? '',
    discountPercent: p.discountPercent?.toString() ?? '',
    isActive: p.isActive,
  };
}

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const loadData = (p = page, s = search) => {
    const skip = (p - 1) * PAGE_SIZE;
    const params = new URLSearchParams({ take: PAGE_SIZE.toString(), skip: skip.toString() });
    if (s) params.set('search', s);
    Promise.all([
      api.get<Category[]>('/categories'),
      api.get<PaginatedProducts>(`/products?${params}`),
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods.items);
      setTotal(prods.total);
    });
  };

  useEffect(() => { if (user?.role === 'ADMIN') loadData(); }, [user]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const openCreate = () => { setEditProduct(null); setForm(EMPTY); setPreview(null); setError(null); setShowModal(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setForm(formFromProduct(p)); setPreview(p.imageUrl); setError(null); setShowModal(true); };

  const handleImageFile = (file: File) => {
    setUploading(true);
    const token = localStorage.getItem('ecommerce_access_token');
    const fd = new FormData();
    fd.append('file', file);
    fetch(`${API_URL}/upload/image`, { method: 'POST', headers: { Authorization: `Bearer ${token ?? ''}` }, body: fd })
      .then((r) => r.json())
      .then(({ url }) => { setForm((f) => ({ ...f, imageUrl: url })); setPreview(url); })
      .catch(() => setError('Error al subir imagen'))
      .finally(() => setUploading(false));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const body = {
      name: form.name, description: form.description,
      price: parseFloat(form.price), stock: parseInt(form.stock, 10),
      categoryId: form.categoryId, imageUrl: form.imageUrl || undefined,
      discountPercent: form.discountPercent ? parseInt(form.discountPercent, 10) : null,
      isActive: form.isActive,
    };
    const req = editProduct
      ? api.patch(`/products/${editProduct.id}`, body)
      : api.post('/products', body);
    req
      .then(() => {
        setShowModal(false);
        showToast(editProduct ? 'Producto actualizado' : 'Producto creado');
        loadData();
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Eliminar este producto?')) return;
    api.delete(`/products/${id}`).then(() => { showToast('Producto eliminado'); loadData(); });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    loadData(1, searchInput);
  };

  const goPage = (p: number) => { setPage(p); loadData(p, search); };

  if (user?.role !== 'ADMIN') return <div className="p-8"><p className="text-red-500 text-sm">Acceso denegado.</p></div>;

  return (
    <div className="p-8">
      {/* Header */}
      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Panel Administrativo</p>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-brand">Productos</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} producto{total !== 1 ? 's' : ''} en total</p>
        </div>
        <button onClick={openCreate} className="btn-primary gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo producto
        </button>
      </div>

      {toast && (
        <div className="mb-5 inline-flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {toast}
        </div>
      )}

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input placeholder="Buscar productos..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="input pl-10" />
        </div>
        <button type="submit" className="btn-primary px-4">Buscar</button>
        {search && <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); loadData(1, ''); }} className="btn-outline px-4">Limpiar</button>}
      </form>

      {/* Table */}
      <div className="card overflow-hidden mb-4">
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Página {page} de {totalPages || 1} · {total} productos
          </p>
        </div>
        {products.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="font-medium">No hay productos</p>
            <button onClick={openCreate} className="btn-primary mt-1">Agregar el primero</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Categoría</th>
                <th className="px-6 py-3 text-right">Precio</th>
                <th className="px-6 py-3 text-center">Descuento</th>
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                const hasDiscount = p.discountPercent && p.discountPercent > 0;
                const finalPrice = hasDiscount ? p.priceDecimal * (1 - p.discountPercent! / 100) : null;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.imageUrl ?? 'https://placehold.co/48x48/f3f4f6/9ca3af?text=N'} alt={p.name} className="h-11 w-11 rounded-xl object-cover bg-gray-100 flex-shrink-0 border border-gray-100" />
                        <div>
                          <p className="font-semibold text-brand">{p.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1 max-w-xs">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="nova-badge bg-gray-100 text-gray-600">{cat?.name ?? '—'}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {hasDiscount ? (
                        <div>
                          <p className="font-bold text-brand">{fmtPrice(finalPrice!, p.currency)}</p>
                          <p className="text-xs text-gray-400 line-through">{fmtPrice(p.priceDecimal, p.currency)}</p>
                        </div>
                      ) : (
                        <p className="font-bold text-brand">{fmtPrice(p.priceDecimal, p.currency)}</p>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {hasDiscount ? (
                        <span className="nova-badge bg-rose-100 text-rose-700 font-bold">-{p.discountPercent}%</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`font-medium ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-green-600'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`nova-badge ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-blue-50 text-gray-300 hover:text-blue-500 transition-colors" title="Editar">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors" title="Eliminar">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => goPage(page - 1)} disabled={page === 1} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e${idx}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => goPage(item as number)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors
                      ${page === item ? 'bg-brand text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                  >
                    {item}
                  </button>
                )
              )}
            <button onClick={() => goPage(page + 1)} disabled={page === totalPages} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-brand">{editProduct ? 'Editar producto' : 'Nuevo producto'}</h2>
                {editProduct && <p className="text-xs text-gray-400 mt-0.5">{editProduct.name}</p>}
              </div>
              <button onClick={() => setShowModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Imagen</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                  className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all
                    ${preview ? 'border-transparent p-0 h-44' : 'border-gray-200 hover:border-brand p-6 h-36 bg-gray-50 hover:bg-gray-100'}`}
                >
                  {preview ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="preview" className="h-44 w-full rounded-2xl object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-semibold">Cambiar imagen</p>
                      </div>
                    </>
                  ) : uploading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <div className="h-5 w-5 rounded-full border-2 border-gray-200 border-t-brand animate-spin" />
                      Subiendo...
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>
                      <p className="text-sm">Click o arrastrá una imagen</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
                <input placeholder="O pegá URL de imagen..." value={form.imageUrl.startsWith('http://localhost') ? '' : form.imageUrl} onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); setPreview(e.target.value || null); }} className="input mt-2 text-xs" />
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Nombre</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Precio (Bs)</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Categoria</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input" required>
                    <option value="">Seleccionar...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Estado</label>
                  <select value={form.isActive ? '1' : '0'} onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })} className="input">
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>

                {/* Descuento / Oferta */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                    Descuento / Oferta
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number" min="0" max="99" placeholder="0"
                        value={form.discountPercent}
                        onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                        className="input pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">%</span>
                    </div>
                    {form.discountPercent && parseFloat(form.discountPercent) > 0 ? (
                      <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm">
                        <span className="nova-badge bg-rose-500 text-white font-bold">-{form.discountPercent}% OFF</span>
                        <span className="text-gray-500">
                          {form.price ? `Bs ${(parseFloat(form.price) * (1 - parseFloat(form.discountPercent) / 100)).toFixed(2)}` : ''}
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Sin descuento activo</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Dejalo en 0 o vacío para quitar el descuento</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Descripcion</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input resize-none" rows={3} required />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting || uploading} className="btn-primary flex-1">
                  {submitting ? (editProduct ? 'Guardando...' : 'Creando...') : (editProduct ? 'Guardar cambios' : 'Crear producto')}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
