import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { quizService } from '@/services/quiz.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { QuizInfo } from '@/models';

export function QuizPreviewPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const quizId = params.get('id');
  const token = params.get('token');

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['public-quizzes-preview'],
    queryFn: () => quizService.getPublicQuizzes(1, 100, ''),
    enabled: !!quizId,
  });

  const quiz = (quizzes as { quizzes?: QuizInfo[] } | undefined)?.quizzes?.find((q) => q.id === quizId);

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!quizId && !token) {
    return (
      <div className="container py-5 text-center text-muted">
        <p>{t('preview.noId')}</p>
        <Link to="/teste" className="btn btn-primary">{t('nav.tests')}</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          {quiz && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h3 className="fw-bold mb-2">{quiz.title}</h3>
                <p className="text-muted">{quiz.description}</p>
                <p className="text-muted small">
                  <i className="bi bi-question-circle me-1" />
                  {quiz.questionCount ?? 0} {t('quiz.questions')}
                  <span className="ms-3">
                    <i className="bi bi-person me-1" />
                    {quiz.authorName}
                  </span>
                </p>
                <Link
                  to={`/token?token=${quizId}`}
                  className="btn btn-primary mt-2"
                >
                  {t('preview.start')}
                </Link>
              </div>
            </div>
          )}
          {!quiz && !isLoading && (
            <div className="text-center text-muted py-5">
              <p>{t('preview.notFound')}</p>
              <Link to="/teste" className="btn btn-primary">{t('nav.tests')}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
