import axios from 'axios';
import { env } from '@/config/env';

export const http = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('uid');
      localStorage.removeItem('name');
      localStorage.removeItem('is_admin');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);
