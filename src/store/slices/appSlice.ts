import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
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
}

const initialState: AppState = {
  theme: 'light',
  language: 'ro',
  limits: DEFAULT_LIMITS,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setLimits: (state, action: PayloadAction<Partial<AppLimits>>) => {
      state.limits = { ...state.limits, ...action.payload };
    },
  },
});

export const { toggleTheme, setTheme, setLanguage, setLimits } = appSlice.actions;
export default appSlice.reducer;
