import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LIMITS } from '@/config/env';

interface AppLimits {
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

interface AppState {
  theme: 'light' | 'dark';
  language: string;
  limits: AppLimits;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: string) => void;
  setLimits: (limits: Partial<AppLimits>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'ro',
      limits: DEFAULT_LIMITS,
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setLimits: (limits) =>
        set((state) => ({ limits: { ...state.limits, ...limits } })),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
