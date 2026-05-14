import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';

export function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, name, isAdmin, logout } = useAuthStore();
  const { theme, toggleTheme, language, setLanguage } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const languages = [
    { code: 'ro', label: 'RO' },
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
    { code: 'es', label: 'ES' },
    { code: 'it', label: 'IT' },
    { code: 'pl', label: 'PL' },
    { code: 'pt', label: 'PT' },
    { code: 'uk', label: 'UK' },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/">
          TesteOnline
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/teste">{t('nav.tests')}</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cursuri">{t('nav.courses')}</Link>
            </li>
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/user-home">{t('nav.dashboard')}</Link>
                </li>
                {isAdmin && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">{t('nav.admin')}</Link>
                  </li>
                )}
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ width: 'auto' }}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={toggleTheme}
              title={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            >
              <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon'}`} />
            </button>

            {isLoggedIn ? (
              <div className="dropdown">
                <button className="btn btn-outline-primary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle me-1" />
                  {name}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">{t('nav.profile')}</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item text-danger" onClick={handleLogout}>{t('nav.logout')}</button></li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-primary btn-sm" to="/signin">{t('nav.signin')}</Link>
                <Link className="btn btn-primary btn-sm" to="/signup">{t('nav.signup')}</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
