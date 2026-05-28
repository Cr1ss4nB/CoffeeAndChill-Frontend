import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject the token into every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    if (config.headers && typeof (config.headers as { set?: (k: string, v: false) => void }).set === 'function') {
      (config.headers as { set: (k: string, v: false) => void }).set('Content-Type', false);
    }
  }
  return config;
});

// Interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout if token is invalid or expired
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export function buildMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
}

export default api;
