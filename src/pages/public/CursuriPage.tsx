import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { quizService } from '@/services/quiz.service';
import { courseService } from '@/services/course.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

interface CursuriPageProps {
  mode?: 'tests' | 'courses';
}

export function CursuriPage({ mode = 'tests' }: CursuriPageProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const testsQuery = useQuery({
    queryKey: ['public-quizzes', page, search],
    queryFn: () => quizService.getPublicQuizzes(page, 20, search),
    enabled: mode === 'tests',
  });

  const coursesQuery = useQuery({
    queryKey: ['public-courses', page, search],
    queryFn: () => courseService.getPublicCourses(page, 20, search),
    enabled: mode === 'courses',
  });

  const query = mode === 'tests' ? testsQuery : coursesQuery;
  const items = mode === 'tests'
    ? (testsQuery.data as { quizzes?: unknown[] } | undefined)?.quizzes
    : (coursesQuery.data as { courses?: unknown[] } | undefined)?.courses;

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-4">
        {mode === 'tests' ? t('cursuri.testsTitle') : t('cursuri.coursesTitle')}
      </h1>

      <div className="mb-4">
        <input
          type="search"
          className="form-control form-control-lg"
          placeholder={t('cursuri.searchPlaceholder')}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {query.isLoading && <LoadingSpinner />}
      {query.isError && <ErrorMessage onRetry={() => query.refetch()} />}

      <div className="row g-3">
        {(items as Array<{ id?: string; title?: string; description?: string; authorName?: string; questionCount?: number }> | undefined)?.map((item) => (
          <div key={item.id} className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title">{item.title}</h5>
                <p className="card-text text-muted small">{item.description}</p>
                <p className="text-muted small mb-0">
                  <i className="bi bi-person me-1" />{item.authorName}
                  {mode === 'tests' && item.questionCount && (
                    <span className="ms-3">
                      <i className="bi bi-question-circle me-1" />{item.questionCount}
                    </span>
                  )}
                </p>
              </div>
              <div className="card-footer bg-transparent">
                {mode === 'tests' ? (
                  <Link to={`/quiz-preview?id=${item.id}`} className="btn btn-primary btn-sm">
                    {t('cursuri.startTest')}
                  </Link>
                ) : (
                  <Link to={`/curs?id=${item.id}`} className="btn btn-primary btn-sm">
                    {t('cursuri.viewCourse')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!query.isLoading && !items?.length && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-search display-4 d-block mb-3" />
          <p>{t('cursuri.noResults')}</p>
        </div>
      )}
    </div>
  );
}
