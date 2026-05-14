import { baseApi } from './baseApi';
import type { Quiz, QuizListItem, QuizResult } from '@/models';

export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyQuizzes: builder.query<QuizListItem[], void>({
      query: () => ({ url: '/quizzes', method: 'POST', body: {} }),
      transformResponse: (res: { quizzes: QuizListItem[] }) => res.quizzes ?? [],
      providesTags: ['Quiz'],
    }),

    getQuiz: builder.query<Quiz, number>({
      query: (quizId) => ({ url: '/get-quiz', method: 'POST', body: { quizId, type: 1 } }),
      transformResponse: (res: { quiz: Quiz }) => res.quiz,
      providesTags: (_, __, id) => [{ type: 'Quiz', id }],
    }),

    deleteQuiz: builder.mutation<void, number>({
      query: (quizId) => ({ url: '/delete-quiz', method: 'POST', body: { quizId } }),
      invalidatesTags: ['Quiz'],
    }),

    cloneQuiz: builder.mutation<{ qid: number }, number>({
      query: (quizId) => ({ url: '/clone-quiz', method: 'POST', body: { quizId } }),
      invalidatesTags: ['Quiz'],
    }),

    getResults: builder.query<QuizResult[], { quizId: number; tokenId: number }>({
      query: ({ quizId, tokenId }) => ({ url: '/results', method: 'POST', body: { quizId, tokenId } }),
      transformResponse: (res: { results: QuizResult[] }) => res.results ?? [],
      providesTags: (_, __, { quizId, tokenId }) => [{ type: 'QuizResult', id: `${quizId}-${tokenId}` }],
    }),

    createToken: builder.mutation<{ token: string }, { quizId: number; description: string; start?: number }>({
      query: ({ quizId, description, start = 1 }) => ({
        url: '/quiz-token',
        method: 'POST',
        body: { quizId, description, start },
      }),
      invalidatesTags: ['Quiz'],
    }),

    updateToken: builder.mutation<void, { keyId: number; start: number }>({
      query: ({ keyId, start }) => ({ url: '/update-token', method: 'POST', body: { keyId, start } }),
      invalidatesTags: ['Quiz'],
    }),

    deleteToken: builder.mutation<void, { quizId: number; token: string }>({
      query: ({ quizId, token }) => ({ url: '/delete-token', method: 'POST', body: { quizId, token } }),
      invalidatesTags: ['Quiz'],
    }),
  }),
});

export const {
  useGetMyQuizzesQuery,
  useGetQuizQuery,
  useDeleteQuizMutation,
  useCloneQuizMutation,
  useGetResultsQuery,
  useCreateTokenMutation,
  useUpdateTokenMutation,
  useDeleteTokenMutation,
} = quizApi;
