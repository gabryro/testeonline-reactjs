export interface CourseSlide {
  id?: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'pdf' | 'quiz';
  orderIndex?: number;
  mediaUrl?: string;
  quizId?: string;
}

export interface Course {
  id?: string;
  title: string;
  description?: string;
  subject?: string;
  isPublic?: boolean;
  slides: CourseSlide[];
  authorId?: string;
  authorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseToken {
  id?: string;
  token: string;
  courseId: string;
  maxStudents?: number;
  expiresAt?: string;
  active?: boolean;
}

export interface CourseCompletion {
  id?: string;
  courseId: string;
  studentName?: string;
  completedAt?: string;
  progress?: number;
}
