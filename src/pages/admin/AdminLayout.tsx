import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/layout/Navbar';

export function AdminLayout() {
  const { t } = useTranslation();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <div className="bg-dark text-white d-flex flex-column" style={{ width: 220 }}>
          <div className="p-3 border-bottom border-secondary">
            <small className="text-secondary text-uppercase fw-bold">{t('admin.panel')}</small>
          </div>
          <nav className="p-2 flex-grow-1">
            <ul className="nav flex-column gap-1">
              {[
                { to: '/admin/dashboard', icon: 'bi-speedometer2', label: t('admin.dashboard') },
                { to: '/admin/users', icon: 'bi-people', label: t('admin.users') },
              ].map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-link d-flex align-items-center gap-2 text-white ${isActive ? 'bg-primary rounded' : 'opacity-75'}`
                    }
                  >
                    <i className={`bi ${item.icon}`} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <main className="flex-grow-1 p-4 bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
