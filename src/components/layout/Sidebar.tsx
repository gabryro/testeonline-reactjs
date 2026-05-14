import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';

export function Sidebar() {
  const { t } = useTranslation();
  const { isAdmin } = useAuthStore();

  const navItems = [
    { to: '/user-home', icon: 'bi-house', label: t('sidebar.dashboard') },
    { to: '/add-quiz', icon: 'bi-plus-circle', label: t('sidebar.addQuiz') },
    { to: '/quiz-review', icon: 'bi-list-check', label: t('sidebar.myQuizzes') },
    { to: '/quiz-report', icon: 'bi-bar-chart', label: t('sidebar.reports') },
    { to: '/add-course', icon: 'bi-book', label: t('sidebar.addCourse') },
    { to: '/question-bank', icon: 'bi-bank', label: t('sidebar.questionBank') },
    { to: '/profile', icon: 'bi-person', label: t('sidebar.profile') },
  ];

  return (
    <div className="sidebar bg-white border-end d-flex flex-column" style={{ width: 250, minHeight: '100vh' }}>
      <div className="p-3 border-bottom">
        <span className="fw-bold text-primary fs-5">TesteOnline</span>
      </div>
      <nav className="flex-grow-1 p-2">
        <ul className="nav nav-pills flex-column gap-1">
          {navItems.map((item) => (
            <li key={item.to} className="nav-item">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : 'text-dark'}`
                }
              >
                <i className={`bi ${item.icon}`} />
                {item.label}
              </NavLink>
            </li>
          ))}
          {isAdmin && (
            <li className="nav-item">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : 'text-dark'}`
                }
              >
                <i className="bi bi-shield-check" />
                {t('sidebar.admin')}
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}
