import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

// Versioned key — bump to 'v2' if the stored schema changes
export const AUTH_TOKEN_KEY = 'coffee-chill:auth-token:v1';

function safeSetToken(token: string) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // localStorage unavailable (incognito, quota exceeded, disabled)
  }
}

function safeRemoveToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // localStorage unavailable
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        safeSetToken(token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        safeRemoveToken();
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'coffee-chill-auth:v1' }
  )
);
