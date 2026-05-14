import { baseApi } from './baseApi';
import type { Question } from '@/models';

export const questionBankApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestionBank: builder.query<Question[], void>({
      query: () => ({ url: '/question-bank', method: 'POST', body: {} }),
      providesTags: ['QuestionBank'],
    }),

    deleteQuestion: builder.mutation<void, number>({
      query: (id) => ({ url: '/delete-question-bank', method: 'POST', body: { id } }),
      invalidatesTags: ['QuestionBank'],
    }),
  }),
});

export const { useGetQuestionBankQuery, useDeleteQuestionMutation } = questionBankApi;
