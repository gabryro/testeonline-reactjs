import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { quizService } from '@/services/quiz.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { QuizInfo } from '@/models';

export function ReviewPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['my-quizzes'],
    queryFn: quizService.getMyQuizzes,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quizService.deleteQuiz(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-quizzes'] });
      toast.success(t('quiz.deleted'));
    },
    onError: () => toast.error(t('quiz.deleteError')),
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => quizService.cloneQuiz(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-quizzes'] });
      toast.success(t('quiz.cloned'));
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      quizService.setVisibility(id, isPublic),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-quizzes'] }),
  });

  const filtered = quizzes?.filter((q) =>
    q.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">{t('review.title')}</h2>
        <Link to="/add-quiz" className="btn btn-primary">
          <i className="bi bi-plus me-2" />
          {t('review.addQuiz')}
        </Link>
      </div>

      <div className="mb-3">
        <input
          type="search"
          className="form-control"
          placeholder={t('review.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && !filtered?.length && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-clipboard2 display-4 d-block mb-3" />
          <p>{t('review.empty')}</p>
          <Link to="/add-quiz" className="btn btn-primary">{t('review.createFirst')}</Link>
        </div>
      )}

      <div className="row g-3">
        {filtered?.map((quiz: QuizInfo) => (
          <div key={quiz.id} className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="fw-semibold">{quiz.title}</div>
                  <div className="text-muted small">
                    {quiz.questionCount ?? 0} {t('quiz.questions')}
                    {quiz.isPublic && (
                      <span className="badge bg-success ms-2">{t('quiz.public')}</span>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    title={quiz.isPublic ? t('quiz.makePrivate') : t('quiz.makePublic')}
                    onClick={() => visibilityMutation.mutate({ id: quiz.id!, isPublic: !quiz.isPublic })}
                  >
                    <i className={`bi bi-${quiz.isPublic ? 'eye-slash' : 'eye'}`} />
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    title={t('quiz.clone')}
                    onClick={() => cloneMutation.mutate(quiz.id!)}
                  >
                    <i className="bi bi-files" />
                  </button>
                  <Link to={`/quiz-report?id=${quiz.id}`} className="btn btn-outline-secondary btn-sm" title={t('quiz.report')}>
                    <i className="bi bi-bar-chart" />
                  </Link>
                  <Link to={`/add-quiz?id=${quiz.id}`} className="btn btn-outline-primary btn-sm" title={t('common.edit')}>
                    <i className="bi bi-pencil" />
                  </Link>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    title={t('common.delete')}
                    onClick={() => {
                      if (confirm(t('quiz.confirmDelete'))) deleteMutation.mutate(quiz.id!);
                    }}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
