'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/store';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      router.push('/products');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error inesperado');
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold mb-6">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        <p className="text-sm text-center">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-brand-accent hover:underline">
            Regístrate
          </Link>
        </p>
        <div className="text-xs text-gray-500 border-t pt-3 mt-3">
          <strong>Demo:</strong> admin@ecommerce.local / Admin123!<br />
          customer@ecommerce.local / Customer123!
        </div>
      </form>
    </div>
  );
}
