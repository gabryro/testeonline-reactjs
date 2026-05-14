import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { loginWithOAuth, type OAuthProvider } from '@/lib/oauth';
import { useAppDispatch } from '@/store/hooks';
import { setAuth } from '@/store/slices/authSlice';
import { env } from '@/config/env';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const MICROSOFT_ICON = (
  <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

export function SignInPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/user-home';

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      if (res.jwt) {
        dispatch(setAuth({
          token: res.jwt,
          uid: res.uid || '',
          name: res.name || '',
          isAdmin: res.is_admin === '1',
          siteKey: res.siteKey,
        }));
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: OAuthProvider) => {
    setOauthLoading(provider);
    try {
      await loginWithOAuth(provider);
    } catch {
      toast.error(t('auth.oauthFailed'));
      setOauthLoading(null);
    }
  };

  const providers: Array<{
    id: OAuthProvider;
    labelKey: string;
    icon: React.ReactNode;
    enabled: boolean;
  }> = [
    { id: 'google',    labelKey: 'auth.continueWithGoogle',    icon: GOOGLE_ICON,                            enabled: !!env.googleClientId },
    { id: 'github',    labelKey: 'auth.continueWithGitHub',    icon: <i className="bi bi-github fs-5" />,    enabled: !!env.githubClientId },
    { id: 'facebook',  labelKey: 'auth.continueWithFacebook',  icon: <i className="bi bi-facebook fs-5" />,  enabled: !!env.facebookAppId },
    { id: 'microsoft', labelKey: 'auth.continueWithMicrosoft', icon: MICROSOFT_ICON,                         enabled: !!env.microsoftClientId },
  ];

  const activeProviders = providers.filter((p) => p.enabled);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title mb-4 text-center fw-bold">{t('auth.signIn')}</h2>

              {/* OAuth buttons */}
              {activeProviders.length > 0 && (
                <>
                  <div className="d-flex flex-column gap-2 mb-3">
                    {activeProviders.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleOAuth(p.id)}
                        disabled={!!oauthLoading}
                      >
                        {oauthLoading === p.id
                          ? <span className="spinner-border spinner-border-sm" />
                          : p.icon}
                        {t(p.labelKey)}
                      </button>
                    ))}
                  </div>

                  <div className="d-flex align-items-center gap-2 mb-3">
                    <hr className="flex-grow-1 m-0" />
                    <span className="text-muted small">{t('auth.orEmail')}</span>
                    <hr className="flex-grow-1 m-0" />
                  </div>
                </>
              )}

              {/* Email / password form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label">{t('auth.email')}</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    {...register('email')}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('auth.password')}</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    {...register('password')}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading || !!oauthLoading}
                >
                  {loading && <span className="spinner-border spinner-border-sm me-2" />}
                  {t('auth.signIn')}
                </button>
              </form>

              <hr />
              <div className="text-center">
                <Link to="/reset-password" className="text-muted small d-block mb-2">
                  {t('auth.forgotPassword')}
                </Link>
                <span className="text-muted small">
                  {t('auth.noAccount')}{' '}
                  <Link to="/signup">{t('auth.signUp')}</Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
