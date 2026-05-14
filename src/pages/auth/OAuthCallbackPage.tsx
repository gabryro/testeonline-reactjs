import { useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const { provider } = useParams<{ provider: string }>();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const code = params.get('code');
    const state = params.get('state');
    if (!code || !provider) { navigate('/signin'); return; }

    const storedState = sessionStorage.getItem('oauth_state');
    if (state && storedState && state !== storedState) {
      toast.error('OAuth state mismatch');
      navigate('/signin');
      return;
    }

    const codeVerifier = sessionStorage.getItem('code_verifier') || undefined;
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('code_verifier');

    authService.oauthToken(provider, code, codeVerifier)
      .then((res) => {
        if (res.jwt) {
          setAuth(res.jwt, res.uid || '', res.name || '', res.is_admin === '1', res.siteKey);
          navigate('/user-home', { replace: true });
        } else {
          navigate('/signin');
        }
      })
      .catch(() => {
        toast.error('OAuth authentication failed');
        navigate('/signin');
      });
  }, [params, provider, navigate, setAuth]);

  return <LoadingSpinner fullScreen />;
}
