import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

const passwordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { t } = useTranslation();
  const { name, uid } = useAuthStore();
  const [geminiKey, setGeminiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const handleSaveGeminiKey = async () => {
    if (!geminiKey) return;
    setSavingKey(true);
    try {
      await authService.saveGeminiKey(geminiKey);
      toast.success(t('profile.geminiKeySaved'));
      setGeminiKey('');
    } catch {
      toast.error(t('profile.geminiKeyError'));
    } finally {
      setSavingKey(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setChangingPwd(true);
    try {
      await authService.changePassword(data.oldPassword, data.newPassword);
      toast.success(t('profile.passwordChanged'));
      reset();
    } catch {
      toast.error(t('profile.passwordError'));
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="row g-4">
      <div className="col-12">
        <h2 className="fw-bold mb-4">{t('profile.title')}</h2>
      </div>

      {/* Profile info */}
      <div className="col-md-6">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body p-4">
            <h5 className="fw-semibold mb-3">{t('profile.info')}</h5>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                <i className="bi bi-person-circle fs-2 text-primary" />
              </div>
              <div>
                <div className="fw-bold fs-5">{name}</div>
                <div className="text-muted small">ID: {uid}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="col-md-6">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body p-4">
            <h5 className="fw-semibold mb-3">{t('profile.changePassword')}</h5>
            <form onSubmit={handleSubmit(onPasswordSubmit)}>
              <div className="mb-2">
                <input
                  type="password"
                  className={`form-control ${errors.oldPassword ? 'is-invalid' : ''}`}
                  placeholder={t('profile.oldPassword')}
                  {...register('oldPassword')}
                />
              </div>
              <div className="mb-2">
                <input
                  type="password"
                  className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                  placeholder={t('profile.newPassword')}
                  {...register('newPassword')}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder={t('profile.confirmPassword')}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback d-block">{errors.confirmPassword.message}</div>
                )}
              </div>
              <button type="submit" className="btn btn-primary w-100" disabled={changingPwd}>
                {changingPwd && <span className="spinner-border spinner-border-sm me-2" />}
                {t('profile.changePassword')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Gemini API Key */}
      <div className="col-12">
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h5 className="fw-semibold mb-1">{t('profile.geminiKey')}</h5>
            <p className="text-muted small mb-3">{t('profile.geminiKeyDesc')}</p>
            <div className="input-group">
              <input
                type="password"
                className="form-control"
                placeholder={t('profile.geminiKeyPlaceholder')}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={handleSaveGeminiKey}
                disabled={savingKey || !geminiKey}
              >
                {savingKey && <span className="spinner-border spinner-border-sm me-2" />}
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
