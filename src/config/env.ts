export const env = {
  apiUrl: import.meta.env.VITE_API_URL || '/api/v1',
  baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:4200',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  facebookAppId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
  microsoftClientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
  isProd: import.meta.env.PROD,
  isDev: import.meta.env.DEV,
};

export const DEFAULT_LIMITS = {
  maxQuizzesPerUser: 100,
  maxQuestionsPerQuiz: 100,
  maxKeysPerQuiz: 100,
  maxCoursesPerUser: 10,
  maxStudentsPerKey: 10,
  maxDocumentFileSizeMb: 50,
  maxDocumentFileSizeBytes: 52428800,
  maxPdfPages: 100,
  maxVisionFileSizeMb: 15,
  maxAiGeneratedQuestions: 20,
};
