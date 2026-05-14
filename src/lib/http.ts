import axios from 'axios';
import { env } from '@/config/env';
import { store } from '@/store/store';
import { logout } from '@/store/slices/authSlice';

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
  const { token, uid } = store.getState().auth;

  if (token && uid) {
    config.headers.Authorization = `Bearer ${token}`;
    if (
      config.method?.toLowerCase() === 'post' &&
      config.data !== undefined &&
      !(config.data instanceof FormData)
    ) {
      config.data = { uid, jwt: token, ...config.data };
    }
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);
