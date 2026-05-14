import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';

export function HomePage() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuthStore();

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-5">
        <div className="container py-4">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-3">{t('home.hero.title')}</h1>
              <p className="lead mb-4">{t('home.hero.subtitle')}</p>
              <div className="d-flex gap-3">
                {isLoggedIn ? (
                  <Link to="/user-home" className="btn btn-light btn-lg">
                    {t('home.hero.dashboard')}
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="btn btn-light btn-lg">
                      {t('home.hero.getStarted')}
                    </Link>
                    <Link to="/teste" className="btn btn-outline-light btn-lg">
                      {t('home.hero.browseTests')}
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="col-lg-6 text-center mt-4 mt-lg-0">
              <i className="bi bi-clipboard2-check" style={{ fontSize: '10rem', opacity: 0.3 }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">{t('home.features.title')}</h2>
          <div className="row g-4">
            {[
              { icon: 'bi-pencil-square', key: 'createQuiz' },
              { icon: 'bi-people', key: 'shareTests' },
              { icon: 'bi-bar-chart', key: 'trackProgress' },
              { icon: 'bi-robot', key: 'aiPowered' },
              { icon: 'bi-book', key: 'courses' },
              { icon: 'bi-translate', key: 'multiLanguage' },
            ].map((f) => (
              <div key={f.key} className="col-md-4">
                <div className="card h-100 border-0 shadow-sm text-center p-3">
                  <div className="card-body">
                    <i className={`bi ${f.icon} display-5 text-primary mb-3`} />
                    <h5 className="card-title">{t(`home.features.${f.key}.title`)}</h5>
                    <p className="card-text text-muted">{t(`home.features.${f.key}.desc`)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isLoggedIn && (
        <section className="bg-light py-5">
          <div className="container text-center">
            <h2 className="fw-bold mb-3">{t('home.cta.title')}</h2>
            <p className="text-muted mb-4">{t('home.cta.subtitle')}</p>
            <Link to="/signup" className="btn btn-primary btn-lg">
              {t('home.cta.button')}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
