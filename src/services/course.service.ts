import { http } from '@/lib/http';
import type { Course, CourseToken, CourseCompletion } from '@/models';

export const courseService = {
  getMyCourses: () =>
    http.post<Course[]>('/courses', {}).then((r) => r.data),

  getCourse: (id: string) =>
    http.post<Course>('/get-course', { id }).then((r) => r.data),

  saveCourse: (course: Course) =>
    http.post<{ id: string }>('/save-course', course).then((r) => r.data),

  deleteCourse: (id: string) =>
    http.post('/delete-course', { id }).then((r) => r.data),

  toggleVisibility: (id: string, isPublic: boolean) =>
    http.post('/toggle-course-visibility', { id, isPublic }).then((r) => r.data),

  generateToken: (courseId: string, config?: Partial<CourseToken>) =>
    http.post<CourseToken>('/course-token', { courseId, ...config }).then((r) => r.data),

  updateToken: (token: Partial<CourseToken>) =>
    http.post<CourseToken>('/update-course-token', token).then((r) => r.data),

  deleteToken: (tokenId: string) =>
    http.post('/delete-course-token', { id: tokenId }).then((r) => r.data),

  getCourseByToken: (token: string) =>
    http.post<Course>('/course-by-token', { token }).then((r) => r.data),

  recordStart: (courseId: string, studentName: string) =>
    http.post('/record-course-start', { courseId, studentName }).then((r) => r.data),

  recordCompletion: (courseId: string, studentName: string) =>
    http.post('/record-course-completion', { courseId, studentName }).then((r) => r.data),

  uploadDocument: (formData: FormData) =>
    http.post<{ url: string }>('/upload-course-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  getCompletions: (courseId: string) =>
    http.post<CourseCompletion[]>('/course-completions', { courseId }).then((r) => r.data),

  getPublicCourses: (page = 1, limit = 20, search = '') =>
    http.post<{ courses: Course[]; total: number }>('/get-public-courses', { page, limit, search }).then((r) => r.data),
};
