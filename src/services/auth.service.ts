import { http } from '@/lib/http';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/models';

export const authService = {
  login: (data: LoginRequest) =>
    http.post<AuthResponse>('/user/authenticate', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    http.post<AuthResponse>('/user/register', data).then((r) => r.data),

  checkSession: () =>
    http.post<AuthResponse>('/session', {}).then((r) => r.data),

  checkJwt: () =>
    http.post<AuthResponse>('/checkJWT', {}).then((r) => r.data),

  requestPasswordReset: (email: string) =>
    http.post('/user/reset-password', { email }).then((r) => r.data),

  resetPasswordWithToken: (token: string, password: string) =>
    http.post('/changePasswordWithURL', { token, password }).then((r) => r.data),

  changePassword: (oldPassword: string, newPassword: string) =>
    http.post('/change-password', { oldPassword, newPassword }).then((r) => r.data),

  confirmEmail: (token: string) =>
    http.post('/confirm-email', { token }).then((r) => r.data),

  oauthToken: (provider: string, code: string, codeVerifier?: string) =>
    http.post(`/oauth/${provider}/token`, { code, codeVerifier }).then((r) => r.data),

  saveGeminiKey: (key: string) =>
    http.post('/user/gemini-key', { key }).then((r) => r.data),

  getGeminiKeyStatus: () =>
    http.get<{ hasKey: boolean }>('/user/gemini-key').then((r) => r.data),

  contact: (name: string, email: string, message: string) =>
    http.post('/contact', { name, email, message }).then((r) => r.data),
};
