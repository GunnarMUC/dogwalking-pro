import { create } from 'zustand';
import type { User } from '@dogwalking/shared';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await api.login({ email, password });
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  register: async (data: any) => {
    try {
      const response = await api.register(data);
      set({ user: response.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      // Clear state even if request fails
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.getCurrentUser();
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

