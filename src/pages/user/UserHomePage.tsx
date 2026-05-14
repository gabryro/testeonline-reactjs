import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '@/store/hooks';
import { useGetMyQuizzesQuery } from '@/store/api/quizApi';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function UserHomePage() {
  const { t } = useTranslation();
  const name = useAppSelector((s) => s.auth.name);

  const { data: quizzes, isLoading } = useGetMyQuizzesQuery();

  const totalResponses = quizzes?.reduce(
    (sum, q) => sum + (q.tokens?.reduce((s, k) => s + (k.responses ?? 0), 0) ?? 0),
    0,
  ) ?? 0;

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">{t('dashboard.welcome', { name })}</h2>
        <p className="text-muted mb-0">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: t('dashboard.quizzes'),
            value: quizzes?.length ?? '—',
            icon: 'bi-clipboard2-check',
            color: 'primary',
            link: '/quiz-review',
          },
          {
            label: t('dashboard.totalResponses'),
            value: totalResponses,
            icon: 'bi-people',
            color: 'success',
            link: '/quiz-report',
          },
        ].map((stat) => (
          <div key={stat.label} className="col-6 col-md-3">
            <Link to={stat.link} className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex align-items-center gap-3">
                  <div className={`bg-${stat.color} bg-opacity-10 rounded p-3`}>
                    <i className={`bi ${stat.icon} fs-4 text-${stat.color}`} />
                  </div>
                  <div>
                    <div className="fs-4 fw-bold">{stat.value}</div>
                    <div className="text-muted small">{stat.label}</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-4">
        <h5 className="fw-semibold mb-3">{t('dashboard.quickActions')}</h5>
        <div className="row g-3">
          {[
            { to: '/add-quiz',     icon: 'bi-plus-circle',    label: t('dashboard.createQuiz'),    variant: 'primary' },
            { to: '/quiz-review',  icon: 'bi-list-check',     label: t('dashboard.manageQuizzes'), variant: 'outline-primary' },
            { to: '/quiz-report',  icon: 'bi-bar-chart-line', label: t('dashboard.viewReports'),   variant: 'outline-secondary' },
            { to: '/token',        icon: 'bi-key',            label: t('dashboard.takeQuiz'),      variant: 'outline-success' },
          ].map((action) => (
            <div key={action.to} className="col-6 col-md-3">
              <Link
                to={action.to}
                className={`btn btn-${action.variant} w-100 d-flex flex-column align-items-center gap-1 py-3`}
              >
                <i className={`bi ${action.icon} fs-4`} />
                <span className="small">{action.label}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent quizzes */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-semibold">{t('dashboard.recentQuizzes')}</h6>
          <Link to="/quiz-review" className="btn btn-link btn-sm p-0">{t('common.viewAll')}</Link>
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="p-3"><LoadingSpinner /></div>
          ) : (
            <div className="list-group list-group-flush">
              {quizzes?.slice(0, 5).map((quiz) => (
                <div key={quiz.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{quiz.name}</div>
                    <div className="text-muted small">
                      {quiz.tokens?.length ?? 0} {t('quiz.keys')}
                      <span className="mx-2">·</span>
                      {quiz.tokens?.reduce((s, k) => s + (k.responses ?? 0), 0) ?? 0} {t('quiz.responses')}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Link to={`/add-quiz?id=${quiz.id}`} className="btn btn-outline-primary btn-sm">
                      <i className="bi bi-pencil" />
                    </Link>
                    <Link to={`/quiz-report?id=${quiz.id}`} className="btn btn-outline-secondary btn-sm">
                      <i className="bi bi-bar-chart" />
                    </Link>
                  </div>
                </div>
              ))}
              {!quizzes?.length && (
                <div className="p-4 text-center text-muted">
                  <p>{t('dashboard.noQuizzes')}</p>
                  <Link to="/add-quiz" className="btn btn-primary btn-sm">
                    {t('dashboard.createQuiz')}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
