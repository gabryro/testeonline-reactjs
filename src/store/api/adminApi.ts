import { baseApi } from './baseApi';
import type { AdminStats, AdminUser, AdminUsersResponse } from '@/models/admin';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, void>({
      query: () => '/admin/stats',
      providesTags: ['AdminStats'],
    }),

    getAdminUsers: builder.query<AdminUsersResponse, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 20, search = '' } = {}) =>
        `/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
      providesTags: ['AdminUser'],
    }),

    updateUser: builder.mutation<AdminUser, { id: string; data: Partial<AdminUser> }>({
      query: ({ id, data }) => ({ url: `/admin/users/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['AdminUser'],
    }),
  }),
});

export const { useGetAdminStatsQuery, useGetAdminUsersQuery, useUpdateUserMutation } = adminApi;
