import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { AdminUser } from '@/models/admin';
import { useGetAdminStatsQuery, useGetAdminUsersQuery, useUpdateUserMutation } from '@/store/api/adminApi';

export function AdminDashboardPage() {
  const { t } = useTranslation();

  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();

  return (
    <div>
      <h2 className="fw-bold mb-4">{t('admin.dashboard')}</h2>

      {statsLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="row g-3">
          {[
            { label: t('admin.totalUsers'), value: stats?.totalUsers ?? 0, icon: 'bi-people', color: 'primary' },
            { label: t('admin.totalQuizzes'), value: stats?.totalQuizzes ?? 0, icon: 'bi-clipboard2', color: 'success' },
            { label: t('admin.totalCourses'), value: stats?.totalCourses ?? 0, icon: 'bi-book', color: 'info' },
            { label: t('admin.activeUsers'), value: stats?.activeUsers ?? 0, icon: 'bi-person-check', color: 'warning' },
          ].map((stat) => (
            <div key={stat.label} className="col-6 col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className={`bg-${stat.color} bg-opacity-10 rounded p-3`}>
                    <i className={`bi ${stat.icon} fs-4 text-${stat.color}`} />
                  </div>
                  <div>
                    <div className="fs-3 fw-bold">{stat.value}</div>
                    <div className="text-muted small">{stat.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminUsersPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useGetAdminUsersQuery({ page, limit: 20, search });
  const [updateUser] = useUpdateUserMutation();

  const handleUpdate = (id: string, updates: Partial<AdminUser>) => {
    updateUser({ id, data: updates })
      .unwrap()
      .then(() => toast.success(t('admin.userUpdated')))
      .catch(() => toast.error(t('admin.updateError')));
  };

  return (
    <div>
      <h2 className="fw-bold mb-4">{t('admin.users')}</h2>

      <div className="mb-3">
        <input
          type="search"
          className="form-control"
          placeholder={t('admin.searchUsers')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>{t('admin.name')}</th>
                  <th>{t('admin.email')}</th>
                  <th>{t('admin.role')}</th>
                  <th>{t('admin.status')}</th>
                  <th>{t('admin.joined')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {data?.users?.map((user: AdminUser) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td className="text-muted small">{user.email}</td>
                    <td>
                      <span className={`badge bg-${user.is_admin ? 'danger' : 'secondary'}`}>
                        {user.is_admin ? t('admin.admin') : t('admin.user')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${user.active ? 'success' : 'secondary'}`}>
                        {user.active ? t('admin.active') : t('admin.inactive')}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className={`btn btn-sm ${user.is_admin ? 'btn-outline-secondary' : 'btn-outline-danger'}`}
                          title={user.is_admin ? t('admin.removeAdmin') : t('admin.makeAdmin')}
                          onClick={() => handleUpdate(user.id, { is_admin: !user.is_admin })}
                        >
                          <i className={`bi bi-${user.is_admin ? 'shield-x' : 'shield-check'}`} />
                        </button>
                        <button
                          className={`btn btn-sm ${user.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          title={user.active ? t('admin.deactivate') : t('admin.activate')}
                          onClick={() => handleUpdate(user.id, { active: !user.active })}
                        >
                          <i className={`bi bi-${user.active ? 'person-x' : 'person-check'}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.total > 20 && (
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage((p) => p - 1)}>
                    {t('common.prev')}
                  </button>
                </li>
                {Array.from({ length: Math.ceil(data.total / 20) }, (_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${page >= Math.ceil(data.total / 20) ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                    {t('common.next')}
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
