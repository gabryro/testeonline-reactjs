import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});
type FormData = z.infer<typeof schema>;

export function ContactPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authService.contact(data.name, data.email, data.message);
      toast.success(t('contact.sent'));
      reset();
    } catch {
      toast.error(t('contact.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <h1 className="fw-bold mb-4">{t('contact.title')}</h1>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label">{t('contact.name')}</label>
                  <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name')} />
                  {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('contact.email')}</label>
                  <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email')} />
                  {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">{t('contact.message')}</label>
                  <textarea rows={5} className={`form-control ${errors.message ? 'is-invalid' : ''}`} {...register('message')} />
                  {errors.message && <div className="invalid-feedback">{errors.message.message}</div>}
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading && <span className="spinner-border spinner-border-sm me-2" />}
                  {t('contact.send')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
