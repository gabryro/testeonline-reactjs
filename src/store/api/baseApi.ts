import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { env } from '@/config/env';
import type { RootState } from '../store';
import { logout } from '../slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithAuth: BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const state = api.getState() as RootState;
  const { token, uid } = state.auth;

  // Inject uid + jwt into POST body (backend requirement for all authenticated POST endpoints)
  let modifiedArgs = args;
  if (
    token &&
    uid &&
    typeof args === 'object' &&
    args.method?.toLowerCase() === 'post' &&
    args.body != null &&
    !(args.body instanceof FormData)
  ) {
    modifiedArgs = { ...args, body: { uid, jwt: token, ...args.body } };
  }

  const result = await rawBaseQuery(modifiedArgs, api, extraOptions);

  if (result.error && 'status' in result.error && result.error.status === 401) {
    api.dispatch(logout());
    window.location.href = '/signin';
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  keepUnusedDataFor: 300,
  tagTypes: ['Quiz', 'QuestionBank', 'AdminStats', 'AdminUser', 'QuizResult'],
  endpoints: () => ({}),
});
