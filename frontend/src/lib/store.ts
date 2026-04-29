'use client';
import { create } from 'zustand';
import { api, clearToken, setToken } from './api';
import { AuthResponse, Cart, User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,

  async login(email, password) {
    set({ loading: true });
    try {
      const res = await api.post<AuthResponse>('/users/login', { email, password });
      setToken(res.accessToken);
      set({ user: res.user });
    } finally {
      set({ loading: false });
    }
  },

  async register(data) {
    set({ loading: true });
    try {
      await api.post('/users/register', data);
      await useAuth.getState().login(data.email, data.password);
    } finally {
      set({ loading: false });
    }
  },

  logout() {
    clearToken();
    set({ user: null });
  },

  async loadProfile() {
    try {
      const me = await api.get<User>('/users/me');
      set({ user: me });
    } catch {
      clearToken();
      set({ user: null });
    }
  },
}));

interface CartState {
  cart: Cart | null;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useCart = create<CartState>((set, get) => ({
  cart: null,
  loading: false,

  async refresh() {
    set({ loading: true });
    try {
      const cart = await api.get<Cart>('/cart');
      set({ cart });
    } finally {
      set({ loading: false });
    }
  },

  async addItem(productId, quantity) {
    const cart = await api.post<Cart>('/cart/items', { productId, quantity });
    set({ cart });
  },

  async updateItem(productId, quantity) {
    const cart = await api.patch<Cart>(`/cart/items/${productId}`, { quantity });
    set({ cart });
  },

  async removeItem(productId) {
    const cart = await api.delete<Cart>(`/cart/items/${productId}`);
    set({ cart });
  },

  async clear() {
    const cart = await api.delete<Cart>('/cart');
    set({ cart });
  },
}));
