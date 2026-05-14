import { useTranslation } from 'react-i18next';

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="fw-bold mb-4">{t('about.title')}</h1>
          <p className="lead text-muted mb-4">{t('about.subtitle')}</p>
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h4 className="fw-bold mb-3">{t('about.mission.title')}</h4>
            <p>{t('about.mission.text')}</p>
          </div>
          <div className="card border-0 shadow-sm p-4">
            <h4 className="fw-bold mb-3">{t('about.team.title')}</h4>
            <p>{t('about.team.text')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
