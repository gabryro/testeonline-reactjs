export type QuestionTypeId = 1 | 2 | 3 | 4 | 5 | 6;

export const QUESTION_TYPE_LABELS: Record<QuestionTypeId, string> = {
  1: 'Single choice',
  2: 'Multiple choice',
  3: 'Ordering',
  4: 'Text / Essay',
  5: 'Matching',
  6: 'Ranking',
};

export interface Option {
  id?: number;
  name: string;
  isAnswer?: number;    // 0|1 — hidden from students (type=0)
  rightAnswer?: string; // hidden from students
  selected?: number;    // 0|1 — used when submitting answers
}

export interface Question {
  id?: number;
  name: string;
  questionTypeId: QuestionTypeId;
  score: number;
  options: Option[];
  answerText?: string;  // essay answer (type 4)
}

export interface Quiz {
  id?: number;
  name: string;
  description: string;
  allowBack: boolean;
  allowReview: boolean;
  autoMove: boolean;
  durationSecs: number; // 0 = unlimited; stored as seconds
  requiredAll: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showClock: boolean;
  showPager: boolean;
  questions: Question[];
}

export interface QuizToken {
  id: number;
  token: string;
  description: string;
  start: number;      // 0|1
  responses: number;  // student count
}

export interface QuizListItem {
  id: number;
  name: string;
  description?: string;
  tokens: QuizToken[];
}

export interface QuizResult {
  id?: number;
  name?: string;          // from student.name in DB
  studentName?: string;   // alias used in some contexts
  createdAt?: string;
  endAt?: string;
  answers?: StudentAnswerRecord[];
}

export interface StudentAnswerRecord {
  questionId: number;
  optionId?: number;
  selected?: number;
  answerText?: string;
}
