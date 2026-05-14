import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface CursuriPageProps {
  mode?: 'tests' | 'courses';
}

export function CursuriPage({ mode = 'tests' }: CursuriPageProps) {
  const { t } = useTranslation();

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-4">
        {mode === 'tests' ? t('cursuri.testsTitle') : t('cursuri.coursesTitle')}
      </h1>

      <div className="text-center py-5">
        <i className="bi bi-key display-4 text-primary d-block mb-3" />
        <h5 className="fw-semibold mb-2">{t('cursuri.useCodeTitle')}</h5>
        <p className="text-muted mb-4">{t('cursuri.useCodeDesc')}</p>
        <Link to="/token" className="btn btn-primary btn-lg">
          {t('cursuri.enterCode')}
        </Link>
      </div>
    </div>
  );
}
