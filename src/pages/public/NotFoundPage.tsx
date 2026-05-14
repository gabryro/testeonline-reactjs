import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="container py-5 text-center">
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <h2 className="mb-3">{t('notFound.title')}</h2>
      <p className="text-muted mb-4">{t('notFound.message')}</p>
      <Link to="/" className="btn btn-primary">{t('notFound.goHome')}</Link>
    </div>
  );
}
