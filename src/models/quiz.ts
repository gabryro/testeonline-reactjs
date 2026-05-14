export type QuestionTypeId = 1 | 2 | 3 | 4 | 5 | 6;

export const QUESTION_TYPE_LABELS: Record<QuestionTypeId, string> = {
  1: 'Single choice',
  2: 'Multiple choice',
  3: 'Fill-in-blank',
  4: 'Text / Essay',
  5: 'Ordering',
  6: 'Matching',
};

export interface Option {
  id?: number;
  name: string;
  isAnswer?: number;    // 0|1 for MC; order position (1-based) for ordering/matching
  rightAnswer?: string; // expected text for fill-in-blank (hidden from students)
  selected?: number;    // 0|1 — used when submitting answers
}

export interface Question {
  id?: number;
  name: string;
  questionTypeId: QuestionTypeId;
  score: number;
  options: Option[];
  answerText?: string;  // expected essay answer (type 4, for AI grading)
}

export interface Quiz {
  id?: number;
  name: string;
  description: string;
  allowBack: boolean;
  allowReview: boolean;
  autoMove: boolean;
  duration: number;           // in seconds (backend); UI shows minutes
  requiredAll: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showClock: boolean;
  showPager: boolean;
  isPublic?: boolean;
  questionTimeLimit?: number; // per-question limit in seconds (0 = none)
  notifyOnCompletion?: boolean;
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
  studentName?: string;
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
