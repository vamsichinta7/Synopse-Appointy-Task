import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user_context } = response.data;

        set({
          token,
          user: user_context,
          isAuthenticated: true,
        });

        // Set token for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return response.data;
      },

      register: async (username, email, password) => {
        const response = await api.post('/auth/register', { username, email, password });
        const { token, user_context } = response.data;

        set({
          token,
          user: user_context,
          isAuthenticated: true,
        });

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return response.data;
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });

        delete api.defaults.headers.common['Authorization'];
      },

      setToken: (token) => {
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // Set token on app load
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
