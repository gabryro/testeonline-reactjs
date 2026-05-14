import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/auth.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function ConfirmEmailPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setStatus('error'); return; }
    authService.confirmEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [params]);

  if (status === 'loading') return <LoadingSpinner fullScreen />;

  return (
    <div className="container py-5 text-center">
      {status === 'success' ? (
        <>
          <i className="bi bi-check-circle-fill text-success display-4 mb-3 d-block" />
          <h3>{t('auth.emailConfirmed')}</h3>
          <Link to="/signin" className="btn btn-primary mt-3">{t('auth.signIn')}</Link>
        </>
      ) : (
        <>
          <i className="bi bi-x-circle-fill text-danger display-4 mb-3 d-block" />
          <h3>{t('auth.confirmFailed')}</h3>
          <Link to="/" className="btn btn-outline-primary mt-3">{t('common.home')}</Link>
        </>
      )}
    </div>
  );
}
