export { store, persistor } from './store';
export type { RootState, AppDispatch } from './store';
export { useAppDispatch, useAppSelector } from './hooks';

export { setAuth, logout, setName } from './slices/authSlice';
export { toggleTheme, setTheme, setLanguage, setLimits } from './slices/appSlice';

export {
  useGetMyQuizzesQuery,
  useGetQuizQuery,
  useDeleteQuizMutation,
  useCloneQuizMutation,
  useGetResultsQuery,
  useCreateTokenMutation,
  useUpdateTokenMutation,
  useDeleteTokenMutation,
} from './api/quizApi';

export { useGetQuestionBankQuery, useDeleteQuestionMutation } from './api/questionBankApi';
export { useGetAdminStatsQuery, useGetAdminUsersQuery, useUpdateUserMutation } from './api/adminApi';
export { useGetAppConfigQuery } from './api/configApi';
export { baseApi } from './api/baseApi';
