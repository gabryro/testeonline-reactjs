import { http } from '@/lib/http';
import type { Quiz, QuizInfo, QuizKey, QuizResult } from '@/models';

export const quizService = {
  saveQuiz: (quiz: Quiz) =>
    http.post<{ id: string }>('/save-quiz', quiz).then((r) => r.data),

  getMyQuizzes: () =>
    http.post<QuizInfo[]>('/get-quizzes', {}).then((r) => r.data),

  getPublicQuizzes: (page = 1, limit = 20, search = '') =>
    http.post<{ quizzes: QuizInfo[]; total: number }>('/get-public-quizzes', { page, limit, search }).then((r) => r.data),

  deleteQuiz: (id: string) =>
    http.post('/delete-quiz', { id }).then((r) => r.data),

  cloneQuiz: (id: string) =>
    http.post<{ id: string }>('/clone-quiz', { id }).then((r) => r.data),

  getResults: (quizId: string) =>
    http.post<QuizResult[]>('/results', { quizId }).then((r) => r.data),

  generateToken: (quizId: string, config?: Partial<QuizKey>) =>
    http.post<QuizKey>('/quiz-token', { quizId, ...config }).then((r) => r.data),

  deleteToken: (tokenId: string) =>
    http.post('/delete-token', { id: tokenId }).then((r) => r.data),

  updateToken: (token: Partial<QuizKey>) =>
    http.post<QuizKey>('/update-token', token).then((r) => r.data),

  setVisibility: (id: string, isPublic: boolean) =>
    http.post('/set-quiz-visibility', { id, isPublic }).then((r) => r.data),

  searchSuggest: (query: string) =>
    http.post<string[]>('/search-suggest', { query }).then((r) => r.data),

  resolveToken: (token: string) =>
    http.post<{ type: 'quiz' | 'course'; data: unknown }>('/resolve-token', { token }).then((r) => r.data),
};
