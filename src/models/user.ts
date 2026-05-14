export interface User {
  id?: string;
  name?: string;
  email?: string;
  is_admin?: boolean;
  active?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  jwt?: string;
  uid?: string;
  name?: string;
  is_admin?: string;
  siteKey?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  recaptchaToken?: string;
}
