import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export function AdminGuard() {
  const isLoggedIn = useAppSelector((s) => s.auth.isLoggedIn);
  const isAdmin = useAppSelector((s) => s.auth.isAdmin);

  if (!isLoggedIn) return <Navigate to="/signin" replace />;
  if (!isAdmin) return <Navigate to="/user-home" replace />;

  return <Outlet />;
}
