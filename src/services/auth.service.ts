import { http } from '@/lib/http';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/models';

export const authService = {
  login: (data: LoginRequest) =>
    http.post<AuthResponse>('/user/authenticate', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    http.post<AuthResponse>('/user/register', data).then((r) => r.data),

  checkSession: () =>
    http.post<AuthResponse>('/session', {}).then((r) => r.data),

  checkJwt: (jwt: string) =>
    http.post<AuthResponse>('/checkJWT', { jwt }).then((r) => r.data),

  requestPasswordReset: (email: string) =>
    http.post('/user/reset-password', { email }).then((r) => r.data),

  // Backend expects { jwt, password }
  resetPasswordWithToken: (jwt: string, password: string) =>
    http.post('/changePasswordWithURL', { jwt, password }).then((r) => r.data),

  // Backend expects { uid, jwt (injected by interceptor), password (old), newPassword }
  changePassword: (oldPassword: string, newPassword: string) =>
    http.post('/change-password', { password: oldPassword, newPassword }).then((r) => r.data),

  // Backend expects { jwt }
  confirmEmail: (jwt: string) =>
    http.post('/confirm-email', { jwt }).then((r) => r.data),

  // Backend expects contactForm* field names
  contact: (name: string, email: string, message: string, subject = '') =>
    http.post('/contact', {
      contactFormName: name,
      contactFormEmail: email,
      contactFormMessage: message,
      contactFormSubjects: subject,
    }).then((r) => r.data),
};
