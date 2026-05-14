import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { quizService } from '@/services/quiz.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { QuizResult } from '@/models';

export function ReportPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const quizId = params.get('id');

  const myQuizzesQuery = useQuery({
    queryKey: ['my-quizzes'],
    queryFn: quizService.getMyQuizzes,
    enabled: !quizId,
  });

  const resultsQuery = useQuery({
    queryKey: ['quiz-results', quizId],
    queryFn: () => quizService.getResults(quizId!),
    enabled: !!quizId,
  });

  if (quizId) {
    return (
      <div>
        <div className="d-flex align-items-center gap-2 mb-4">
          <Link to="/quiz-report" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left" />
          </Link>
          <h2 className="fw-bold mb-0">{t('report.results')}</h2>
        </div>

        {resultsQuery.isLoading && <LoadingSpinner />}

        {!resultsQuery.isLoading && !resultsQuery.data?.length && (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-bar-chart display-4 d-block mb-3" />
            <p>{t('report.noResults')}</p>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>{t('report.student')}</th>
                <th>{t('report.score')}</th>
                <th>{t('report.percentage')}</th>
                <th>{t('report.date')}</th>
              </tr>
            </thead>
            <tbody>
              {resultsQuery.data?.map((r: QuizResult) => (
                <tr key={r.id}>
                  <td>{r.studentName ?? t('report.anonymous')}</td>
                  <td>{r.score ?? 0} / {r.maxScore ?? 0}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: 6 }}>
                        <div
                          className={`progress-bar bg-${(r.percentage ?? 0) >= 60 ? 'success' : 'danger'}`}
                          style={{ width: `${r.percentage ?? 0}%` }}
                        />
                      </div>
                      <span className="small">{r.percentage ?? 0}%</span>
                    </div>
                  </td>
                  <td className="text-muted small">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="fw-bold mb-4">{t('report.title')}</h2>
      {myQuizzesQuery.isLoading && <LoadingSpinner />}
      <div className="row g-3">
        {myQuizzesQuery.data?.map((quiz) => (
          <div key={quiz.id} className="col-12">
            <Link to={`/quiz-report?id=${quiz.id}`} className="text-decoration-none">
              <div className="card border-0 shadow-sm">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{quiz.title}</div>
                    <div className="text-muted small">{quiz.questionCount ?? 0} {t('quiz.questions')}</div>
                  </div>
                  <i className="bi bi-chevron-right text-muted" />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
