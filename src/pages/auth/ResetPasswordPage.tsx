import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setSent(true);
      toast.success(t('auth.resetEmailSent'));
    } catch {
      toast.error(t('auth.resetEmailFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="card-title mb-4 text-center fw-bold">{t('auth.resetPassword')}</h2>
              {sent ? (
                <div className="text-center">
                  <div className="alert alert-success">{t('auth.resetEmailSent')}</div>
                  <Link to="/signin" className="btn btn-outline-primary">{t('auth.backToSignIn')}</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">{t('auth.email')}</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading && <span className="spinner-border spinner-border-sm me-2" />}
                    {t('auth.sendResetEmail')}
                  </button>
                  <div className="text-center mt-3">
                    <Link to="/signin" className="text-muted small">{t('auth.backToSignIn')}</Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
