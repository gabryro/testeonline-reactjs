import { http } from '@/lib/http';

export const aiService = {
  generateQuiz: (topic: string, questionCount: number, language?: string) =>
    http.post('/ai/generate-quiz', { topic, questionCount, language }).then((r) => r.data),

  generateQuizFromFile: (formData: FormData) =>
    http.post('/ai/generate-quiz-from-file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  ocrImage: (formData: FormData) =>
    http.post<{ text: string }>('/ai/ocr-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  chat: (quizId: string, message: string, history?: unknown[]) =>
    http.post<{ reply: string }>('/ai/chat', { quizId, message, history }).then((r) => r.data),

  generateCourseSummary: (content: string) =>
    http.post<{ summary: string }>('/ai/generate-course-summary', { content }).then((r) => r.data),

  generateCourseSchema: (topic: string) =>
    http.post('/ai/generate-course-schema', { topic }).then((r) => r.data),
};
