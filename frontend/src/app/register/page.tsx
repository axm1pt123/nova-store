'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    try {
      await register(form);
      router.push('/products');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al registrarse');
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold mb-6">Crear cuenta</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Nombre</label>
            <input
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Apellido</label>
            <input
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className="input"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Contraseña (mín. 8 caracteres)</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="input"
            required
            minLength={8}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creando...' : 'Crear cuenta'}
        </button>
        <p className="text-sm text-center">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-brand-accent hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
