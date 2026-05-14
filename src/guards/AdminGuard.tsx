import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function AdminGuard() {
  const { isLoggedIn, isAdmin } = useAuthStore();

  if (!isLoggedIn) return <Navigate to="/signin" replace />;
  if (!isAdmin) return <Navigate to="/user-home" replace />;

  return <Outlet />;
}
