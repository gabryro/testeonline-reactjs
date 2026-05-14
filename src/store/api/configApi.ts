import { baseApi } from './baseApi';
import { setLimits } from '../slices/appSlice';
import type { AppConfig } from '@/services/config.service';

export const configApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppConfig: builder.query<AppConfig, void>({
      query: () => '/app-config',
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setLimits(data));
        } catch {}
      },
    }),
  }),
});

export const { useGetAppConfigQuery } = configApi;
