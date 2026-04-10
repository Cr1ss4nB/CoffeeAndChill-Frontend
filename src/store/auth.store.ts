import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/api/api.client';
import type { User, LoginCredentials, TokenResponse } from '@/types';

// Versioned key — bump to 'v2' if the stored schema changes
export const AUTH_TOKEN_KEY = 'coffee-chill:auth-token:v1';

/**
 * Maps BE role strings to FE Role constants.
 * BE returns: "admin" | "employee" | "client"
 * FE expects:  "ADMIN" | "EMPLOYEE" | "CUSTOMER"
 */
function normalizeRole(role: string): string {
  const map: Record<string, string> = {
    admin: 'ADMIN',
    employee: 'EMPLOYEE',
    client: 'CUSTOMER',
  };
  return map[role.toLowerCase()] ?? role.toUpperCase();
}

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
  login: (credentials: LoginCredentials) => Promise<void>;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (credentials: LoginCredentials) => {
        const response = await api.post<TokenResponse>('/auth/login', credentials);
        const { user, access_token } = response.data;
        safeSetToken(access_token);
        set({
          user: { ...user, active: true, id: String(user.id), role: normalizeRole(user.role) },
          token: access_token,
          isAuthenticated: true,
        });
      },
      setAuth: (user: User, token: string) => {
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
