import { http, publicHttp } from '@/lib/http';
import type { Quiz, QuizListItem, QuizResult } from '@/models';

export const quizService = {
  // ── Teacher endpoints (authenticated) ──────────────────────────────

  getMyQuizzes: (): Promise<QuizListItem[]> =>
    http.post<{ quizzes: QuizListItem[] }>('/quizzes', {})
      .then((r) => r.data.quizzes ?? []),

  getQuiz: (quizId: number): Promise<Quiz> =>
    http.post<{ quiz: Quiz }>('/get-quiz', { quizId, type: 1 })
      .then((r) => r.data.quiz),

  saveQuiz: (quiz: Partial<Quiz>): Promise<{ qid: number }> =>
    http.post<{ qid: number }>('/save-quiz', { quiz: JSON.stringify(quiz), quizId: quiz.id ?? 0 })
      .then((r) => r.data),

  deleteQuiz: (quizId: number): Promise<void> =>
    http.post('/delete-quiz', { quizId }).then(() => undefined),

  cloneQuiz: (quizId: number): Promise<{ qid: number }> =>
    http.post<{ qid: number }>('/clone-quiz', { quizId })
      .then((r) => r.data),

  getResults: (quizId: number, tokenId: number): Promise<QuizResult[]> =>
    http.post<{ results: QuizResult[] }>('/results', { quizId, tokenId })
      .then((r) => r.data.results ?? []),

  createToken: (quizId: number, description: string, start = 0): Promise<{ token: string }> =>
    http.post<{ token: string }>('/quiz-token', { quizId, description, start })
      .then((r) => r.data),

  deleteToken: (quizId: number, token: string): Promise<void> =>
    http.post('/delete-token', { quizId, token }).then(() => undefined),

  updateToken: (keyId: number, start: number): Promise<void> =>
    http.post('/update-token', { keyId, start }).then(() => undefined),

  // ── Student endpoints (no auth required) ──────────────────────────

  startQuiz: (name: string, key: string): Promise<{ quizId: number; studentId: number }> =>
    publicHttp.post<{ response: { quizId: number; studentId: number } }>('/save-key-start', { name, key })
      .then((r) => r.data.response),

  getPublicQuiz: (quizId: number): Promise<Quiz> =>
    publicHttp.post<{ quiz: Quiz }>('/get-quiz', { quizId, type: 0 })
      .then((r) => r.data.quiz),

  submitResults: (quizId: number, studentId: number, quiz: Partial<Quiz>): Promise<Quiz | null> =>
    publicHttp.post<{ response: Quiz | null }>('/save-results', { quizId, studentId, quiz })
      .then((r) => r.data.response),
};
