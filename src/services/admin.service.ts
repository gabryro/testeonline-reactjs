import { http } from '@/lib/http';
import type { AdminStats, AdminUser, AdminUsersResponse } from '@/models/admin';

export const adminService = {
  getStats: () =>
    http.get<AdminStats>('/admin/stats').then((r) => r.data),

  getUsers: (page = 1, limit = 20, search = '') =>
    http.get<AdminUsersResponse>(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`).then((r) => r.data),

  updateUser: (id: string, data: Partial<AdminUser>) =>
    http.put<AdminUser>(`/admin/users/${id}`, data).then((r) => r.data),
};
