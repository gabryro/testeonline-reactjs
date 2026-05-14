import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// OAuth social login is not yet supported by the backend.
// Redirects to sign in immediately.
export function OAuthCallbackPage() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/signin', { replace: true }); }, [navigate]);
  return <LoadingSpinner fullScreen />;
}
