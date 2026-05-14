import { http } from '@/lib/http';
import type { Question } from '@/models';

export const aiService = {
  // Backend expects { topic, count } — max 20 questions
  generateQuiz: (topic: string, count: number): Promise<{ questions: Question[] }> =>
    http.post('/ai/generate-quiz', { topic, count }).then((r) => r.data),

  // Backend expects { message, quizName?, history? }
  chat: (
    message: string,
    quizName?: string,
    history?: Array<{ role: string; content: string }>,
  ): Promise<{ reply: string }> =>
    http.post('/ai/chat', { message, quizName, history }).then((r) => r.data),

  // Backend expects { question, answer, expectedAnswer?, score? }
  grade: (
    question: string,
    answer: string,
    expectedAnswer?: string,
    score?: number,
  ): Promise<{ grade: { score: number; percentage: number; feedback: string } }> =>
    http.post('/ai/grade', { question, answer, expectedAnswer, score }).then((r) => r.data),
};
