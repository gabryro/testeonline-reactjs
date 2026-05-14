export interface AdminStats {
  totalUsers?: number;
  totalQuizzes?: number;
  totalCourses?: number;
  activeUsers?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
  active: boolean;
  created_at: string;
  quiz_count?: number;
  course_count?: number;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}
