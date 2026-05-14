import { http } from '@/lib/http';

export interface AppConfig {
  maxQuizzesPerUser: number;
  maxQuestionsPerQuiz: number;
  maxKeysPerQuiz: number;
  maxCoursesPerUser: number;
  maxStudentsPerKey: number;
  maxDocumentFileSizeMb: number;
  maxDocumentFileSizeBytes: number;
  maxPdfPages: number;
  maxVisionFileSizeMb: number;
  maxAiGeneratedQuestions: number;
}

export const configService = {
  getAppConfig: () =>
    http.get<AppConfig>('/app-config').then((r) => r.data),
};
