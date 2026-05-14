export interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export interface Question {
  id?: string;
  text: string;
  type: 'single' | 'multiple' | 'text' | 'formula';
  options: Option[];
  points?: number;
  explanation?: string;
  orderIndex?: number;
  mediaUrl?: string;
}

export interface QuizConfig {
  timeLimit?: number;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showResults?: boolean;
  showCorrectAnswers?: boolean;
  maxAttempts?: number;
  passingScore?: number;
}

export interface QuizInfo {
  id?: string;
  title: string;
  description?: string;
  subject?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  questionCount?: number;
  authorName?: string;
  authorId?: string;
}

export interface Quiz extends QuizInfo {
  questions: Question[];
  config?: QuizConfig;
}

export interface QuizKey {
  id?: string;
  key: string;
  quizId: string;
  maxStudents?: number;
  expiresAt?: string;
  studentCount?: number;
  active?: boolean;
}

export interface StudentAnswer {
  questionId: string;
  selectedOptions?: string[];
  textAnswer?: string;
}

export interface QuizResult {
  id?: string;
  quizId: string;
  studentName?: string;
  score?: number;
  maxScore?: number;
  percentage?: number;
  answers?: StudentAnswer[];
  submittedAt?: string;
  timeSpent?: number;
}
