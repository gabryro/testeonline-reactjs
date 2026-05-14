import axios from 'axios';
import { env } from '@/config/env';

export const http = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Public instance for student endpoints — no auth injection
export const publicHttp = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const stored = localStorage.getItem('auth-storage');
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { state?: { token?: string; uid?: string } };
      const { token, uid } = parsed.state ?? {};
      if (token && uid) {
        config.headers.Authorization = `Bearer ${token}`;
        // Backend reads uid+jwt from POST body for every authenticated endpoint
        if (
          config.method?.toLowerCase() === 'post' &&
          config.data !== undefined &&
          !(config.data instanceof FormData)
        ) {
          config.data = { uid, jwt: token, ...config.data };
        }
      }
    } catch {
      // ignore
    }
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);
