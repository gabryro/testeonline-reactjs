import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthGuard } from '@/guards/AuthGuard';
import { AdminGuard } from '@/guards/AdminGuard';

import { HomePage } from '@/pages/public/HomePage';
import { AboutPage } from '@/pages/public/AboutPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { CursuriPage } from '@/pages/public/CursuriPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';

import { SignInPage } from '@/pages/auth/SignInPage';
import { SignUpPage } from '@/pages/auth/SignUpPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ConfirmEmailPage } from '@/pages/auth/ConfirmEmailPage';
import { OAuthCallbackPage } from '@/pages/auth/OAuthCallbackPage';

import { UserHomePage } from '@/pages/user/UserHomePage';
import { ProfilePage } from '@/pages/user/ProfilePage';
import { ReviewPage } from '@/pages/user/ReviewPage';
import { ReportPage } from '@/pages/user/ReportPage';
import { QuestionBankPage } from '@/pages/user/QuestionBankPage';
import { AddTestPage } from '@/pages/user/AddTestPage';
import { StudentPage } from '@/pages/user/StudentPage';
import { QuizPreviewPage } from '@/pages/user/QuizPreviewPage';
import { AddCoursePage } from '@/pages/user/AddCoursePage';
import { CourseViewerPage } from '@/pages/user/CourseViewerPage';

import { AdminLayout } from '@/pages/admin/AdminLayout';
import { AdminDashboardPage, AdminUsersPage } from '@/pages/admin/AdminDashboardPage';

export const router = createBrowserRouter([
  // Public routes with Navbar + Footer
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/about-us', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/teste', element: <CursuriPage mode="tests" /> },
      { path: '/cursuri', element: <CursuriPage mode="courses" /> },
      { path: '/quiz-preview', element: <QuizPreviewPage /> },
      { path: '/curs', element: <CourseViewerPage /> },
      { path: '/token', element: <StudentPage /> },

      // Auth pages (no redirect needed, user can visit these)
      { path: '/signin', element: <SignInPage /> },
      { path: '/signup', element: <SignUpPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/confirm-email', element: <ConfirmEmailPage /> },
      { path: '/oauth-callback/:provider', element: <OAuthCallbackPage /> },
    ],
  },

  // Protected user routes with sidebar dashboard
  {
    element: <AuthGuard />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/user-home', element: <UserHomePage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/add-quiz', element: <AddTestPage /> },
          { path: '/quiz-review', element: <ReviewPage /> },
          { path: '/quiz-report', element: <ReportPage /> },
          { path: '/question-bank', element: <QuestionBankPage /> },
          { path: '/add-course', element: <AddCoursePage /> },
        ],
      },
    ],
  },

  // Admin routes
  {
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
          { path: '/admin/dashboard', element: <AdminDashboardPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
        ],
      },
    ],
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
]);
