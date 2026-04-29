'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Category } from '@/types';

const COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
  { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
  { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  { bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-500' },
];

const EMOJIS = ['📦', '🎧', '📚', '💻', '📱', '🎮', '👗', '🏠', '🍎', '⚽', '🎨', '🔧'];

function getColorForIndex(i: number) {
  return COLORS[i % COLORS.length];
}

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📦');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadCategories = () => {
    api.get<Category[]>('/categories').then(setCategories).catch(() => {});
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') loadCategories();
  }, [user]);

  const openModal = () => {
    setName('');
    setDescription('');
    setSelectedEmoji('📦');
    setError(null);
    setShowModal(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    api
      .post('/categories', { name, slug, description: description || undefined })
      .then(() => {
        setShowModal(false);
        loadCategories();
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error al crear categoria');
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    api.delete(`/categories/${id}`)
      .then(() => loadCategories())
      .catch(() => {})
      .finally(() => setDeleteId(null));
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-8"><p className="text-red-500 text-sm">Acceso denegado.</p></div>;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Panel Administrativo</p>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-brand">Categorias</h1>
          <p className="text-sm text-gray-400 mt-0.5">{categories.length} categoria{categories.length !== 1 ? 's' : ''} en total</p>
        </div>
        <button onClick={openModal} className="btn-primary gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva categoria
        </button>
      </div>

      {/* Categories grid */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100 text-4xl">
            🏷️
          </div>
          <p className="font-semibold text-brand">Sin categorias todavia</p>
          <p className="text-sm mt-1 mb-4">Crea la primera para organizar tus productos</p>
          <button onClick={openModal} className="btn-primary">Crear categoria</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const color = getColorForIndex(i);
            return (
              <div
                key={cat.id}
                className="group card p-5 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
              >
                {/* Icon + actions */}
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${color.bg}`}>
                    {EMOJIS[i % EMOJIS.length]}
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deleteId === cat.id}
                    className="flex h-7 w-7 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
                  >
                    {deleteId === cat.id ? (
                      <div className="h-3 w-3 rounded-full border border-red-300 border-t-red-500 animate-spin" />
                    ) : (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-bold text-brand">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {cat.description ?? 'Sin descripcion'}
                  </p>
                </div>

                {/* Slug badge */}
                <div className="flex items-center justify-between">
                  <code className={`rounded-lg px-2.5 py-1 text-xs font-mono ${color.bg} ${color.text}`}>
                    {cat.slug}
                  </code>
                  <span className={`flex h-2 w-2 rounded-full ${color.dot}`} />
                </div>
              </div>
            );
          })}

          {/* Add card */}
          <button
            onClick={openModal}
            className="card border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center gap-2 hover:border-brand hover:bg-gray-50 transition-all duration-200 min-h-[140px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400">Agregar categoria</p>
          </button>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-brand">Nueva categoria</h2>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-8 py-6 space-y-5">
              {/* Emoji selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Icono</label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all
                        ${selectedEmoji === emoji
                          ? 'bg-brand text-white shadow-md scale-110'
                          : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-xl">
                  {selectedEmoji}
                </div>
                <div>
                  <p className="font-semibold text-brand text-sm">{name || 'Nombre de la categoria'}</p>
                  <p className="text-xs text-gray-400">{description || 'Descripcion...'}</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Nombre</label>
                <input
                  placeholder="Ej: Smartphones"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                  autoFocus
                />
                {name && (
                  <p className="mt-1 text-xs text-gray-400">
                    Slug: <code className="font-mono">{name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}</code>
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Descripcion <span className="normal-case font-normal">(opcional)</span></label>
                <textarea
                  placeholder="Descripcion breve de la categoria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input resize-none"
                  rows={2}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Creando...' : 'Crear categoria'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
