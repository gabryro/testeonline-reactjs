import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-light border-top mt-auto py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold text-primary">TesteOnline</h6>
            <p className="text-muted small">{t('footer.tagline')}</p>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">{t('footer.links')}</h6>
            <ul className="list-unstyled">
              <li><Link className="text-muted small text-decoration-none" to="/teste">{t('nav.tests')}</Link></li>
              <li><Link className="text-muted small text-decoration-none" to="/cursuri">{t('nav.courses')}</Link></li>
              <li><Link className="text-muted small text-decoration-none" to="/about-us">{t('nav.about')}</Link></li>
              <li><Link className="text-muted small text-decoration-none" to="/contact">{t('nav.contact')}</Link></li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">{t('footer.account')}</h6>
            <ul className="list-unstyled">
              <li><Link className="text-muted small text-decoration-none" to="/signin">{t('nav.signin')}</Link></li>
              <li><Link className="text-muted small text-decoration-none" to="/signup">{t('nav.signup')}</Link></li>
            </ul>
          </div>
        </div>
        <hr />
        <p className="text-center text-muted small mb-0">
          &copy; {year} TesteOnline. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
