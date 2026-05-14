import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/authSlice';
import { authService } from '@/services/auth.service';

export function OAuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { provider } = useParams<{ provider: string }>();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') ?? '';
    const state = params.get('state') ?? '';

    const storedState = sessionStorage.getItem('oauth_state') ?? '';
    const storedProvider = sessionStorage.getItem('oauth_provider') ?? '';
    const verifier = sessionStorage.getItem('oauth_code_verifier') ?? '';

    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('oauth_provider');
    sessionStorage.removeItem('oauth_code_verifier');

    if (!code || !state || state !== storedState || !provider || provider !== storedProvider) {
      setError(t('auth.oauthInvalid'));
      return;
    }

    authService.exchangeOAuthCode(provider, code, verifier)
      .then((res) => {
        if (!res.jwt) { setError(t('auth.oauthFailed')); return; }
        dispatch(setAuth({
          token: res.jwt,
          uid: res.uid || '',
          name: res.name || '',
          isAdmin: res.is_admin === '1',
          siteKey: res.siteKey,
        }));
        navigate('/user-home', { replace: true });
      })
      .catch((err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg || t('auth.oauthFailed'));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-5 text-center">
            <i className="bi bi-exclamation-circle text-danger display-4 mb-3 d-block" />
            <h5 className="fw-semibold mb-2">{t('auth.oauthError')}</h5>
            <p className="text-muted mb-4">{error}</p>
            <a href="/signin" className="btn btn-primary">{t('auth.backToSignIn')}</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-primary mb-3" role="status" />
      <p className="text-muted">{t('auth.oauthLoading')}</p>
    </div>
  );
}
