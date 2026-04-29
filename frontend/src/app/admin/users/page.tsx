'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/store';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'ADMIN' | 'CUSTOMER';
  phone: string | null;
  isActive: boolean;
  createdAt: string;
}

interface CreateForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'CUSTOMER';
  phone: string;
}

const EMPTY: CreateForm = {
  firstName: '', lastName: '', email: '',
  password: '', role: 'CUSTOMER', phone: '',
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'CUSTOMER'>('ALL');

  const loadUsers = () => {
    setLoading(true);
    api.get<AdminUser[]>('/users/admin/list')
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') loadUsers();
  }, [user]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    api.post<AdminUser>('/users/admin/create', {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      role: form.role,
      phone: form.phone || undefined,
    })
      .then((u) => {
        setShowModal(false);
        setForm(EMPTY);
        setSuccess(`Usuario ${u.fullName} creado correctamente`);
        setTimeout(() => setSuccess(null), 4000);
        loadUsers();
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error al crear usuario');
      })
      .finally(() => setSubmitting(false));
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-8"><p className="text-red-500 text-sm">Acceso denegado.</p></div>;
  }

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const admins = users.filter((u) => u.role === 'ADMIN').length;
  const customers = users.filter((u) => u.role === 'CUSTOMER').length;

  return (
    <div className="p-8">
      <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Panel Administrativo</p>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-brand">Usuarios</h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setError(null); setShowModal(true); }} className="btn-primary gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {success && (
        <div className="mb-5 inline-flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-3xl font-black text-brand mt-1">{users.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admins</p>
          <p className="text-3xl font-black text-blue-600 mt-1">{admins}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clientes</p>
          <p className="text-3xl font-black text-green-600 mt-1">{customers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'ADMIN', 'CUSTOMER'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all
                ${roleFilter === r ? 'bg-brand text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {r === 'ALL' ? 'Todos' : r === 'ADMIN' ? 'Admins' : 'Clientes'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">👤</p>
            <p className="font-medium text-brand">Sin resultados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Teléfono</th>
                <th className="px-6 py-3">Registrado</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const initials = `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
                const colors: Record<string, string> = {
                  ADMIN: 'bg-blue-100 text-blue-600',
                  CUSTOMER: 'bg-green-100 text-green-600',
                };
                const avatarColors: Record<string, string> = {
                  ADMIN: 'bg-blue-500',
                  CUSTOMER: 'bg-green-500',
                };
                return (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0 ${avatarColors[u.role] ?? 'bg-gray-400'}`}>
                          {initials}
                        </div>
                        <span className="font-semibold text-brand">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{u.email}</td>
                    <td className="px-6 py-3">
                      <span className={`nova-badge ${colors[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{u.phone ?? '—'}</td>
                    <td className="px-6 py-3 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`nova-badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create user modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-black text-brand">Nuevo usuario</h2>
              <button onClick={() => setShowModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="px-8 py-6 space-y-4">
              {/* Role selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Tipo de usuario</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['CUSTOMER', 'ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, role: r })}
                      className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-sm font-semibold transition-all
                        ${form.role === r ? 'border-brand bg-brand/5 text-brand' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                    >
                      <span className="text-xl">{r === 'CUSTOMER' ? '👤' : '🛡️'}</span>
                      {r === 'CUSTOMER' ? 'Cliente' : 'Administrador'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Nombre</label>
                  <input placeholder="Juan" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Apellido</label>
                  <input placeholder="Pérez" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
                <input type="email" placeholder="juan@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Contraseña</label>
                <input type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" required minLength={8} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Teléfono <span className="normal-case font-normal">(opcional)</span></label>
                <input placeholder="+54 9 11 1234-5678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
              </div>

              {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Creando...' : 'Crear usuario'}
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
