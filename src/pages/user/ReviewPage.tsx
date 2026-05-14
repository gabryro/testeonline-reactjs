import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { env } from '@/config/env';
import type { QuizListItem, QuizToken } from '@/models';
import {
  useGetMyQuizzesQuery,
  useDeleteQuizMutation,
  useCloneQuizMutation,
  useCreateTokenMutation,
  useUpdateTokenMutation,
  useDeleteTokenMutation,
} from '@/store/api/quizApi';

function KeyRow({ quizId, token }: { quizId: number; token: QuizToken }) {
  const { t } = useTranslation();
  const [updateToken, { isLoading: toggling }] = useUpdateTokenMutation();
  const [deleteToken, { isLoading: deleting }] = useDeleteTokenMutation();

  const copyLink = () => {
    const url = `${env.baseUrl}/token?code=${token.token}`;
    navigator.clipboard.writeText(url).then(() => toast.success(t('quiz.linkCopied')));
  };

  const handleToggle = () => {
    updateToken({ keyId: token.id, start: token.start === 1 ? 0 : 1 })
      .unwrap()
      .catch(() => toast.error(t('quiz.keyError')));
  };

  const handleDelete = () => {
    if (confirm(t('quiz.confirmDeleteKey'))) {
      deleteToken({ quizId, token: token.token })
        .unwrap()
        .catch(() => toast.error(t('quiz.keyError')));
    }
  };

  return (
    <tr>
      <td>
        <code className="user-select-all">{token.token}</code>
      </td>
      <td className="text-muted small">{token.description || '—'}</td>
      <td>
        <span className={`badge ${token.start === 1 ? 'bg-success' : 'bg-secondary'}`}>
          {token.start === 1 ? t('quiz.active') : t('quiz.inactive')}
        </span>
      </td>
      <td>{token.responses ?? 0}</td>
      <td>
        <div className="d-flex gap-1">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={copyLink}
            title={t('quiz.copyLink')}
          >
            <i className="bi bi-clipboard" />
          </button>
          <button
            className={`btn btn-sm ${token.start === 1 ? 'btn-outline-warning' : 'btn-outline-success'}`}
            onClick={handleToggle}
            disabled={toggling}
            title={token.start === 1 ? t('quiz.deactivate') : t('quiz.activate')}
          >
            <i className={`bi bi-${token.start === 1 ? 'pause' : 'play'}`} />
          </button>
          <Link
            to={`/quiz-report?id=${quizId}&token=${token.id}`}
            className="btn btn-outline-secondary btn-sm"
            title={t('quiz.report')}
          >
            <i className="bi bi-bar-chart" />
          </Link>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
            title={t('quiz.deleteKey')}
          >
            <i className="bi bi-trash" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function QuizCard({ quiz }: { quiz: QuizListItem }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);

  const [deleteQuiz, { isLoading: deleting }] = useDeleteQuizMutation();
  const [cloneQuiz, { isLoading: cloning }] = useCloneQuizMutation();
  const [createToken, { isLoading: creatingToken }] = useCreateTokenMutation();

  const handleDelete = () => {
    if (confirm(t('quiz.confirmDelete'))) {
      deleteQuiz(quiz.id)
        .unwrap()
        .then(() => toast.success(t('quiz.deleted')))
        .catch((err: { data?: { message?: string } }) =>
          toast.error(err?.data?.message || t('quiz.deleteError')),
        );
    }
  };

  const handleClone = () => {
    cloneQuiz(quiz.id)
      .unwrap()
      .then(() => toast.success(t('quiz.cloned')))
      .catch(() => toast.error(t('quiz.deleteError')));
  };

  const handleCreateKey = () => {
    createToken({ quizId: quiz.id, description: newDesc, start: 1 })
      .unwrap()
      .then(() => {
        toast.success(t('quiz.keyCreated'));
        setNewDesc('');
        setCreatingKey(false);
      })
      .catch((err: { data?: { message?: string } }) =>
        toast.error(err?.data?.message || t('quiz.keyError')),
      );
  };

  const totalResponses = quiz.tokens?.reduce((s, k) => s + (k.responses ?? 0), 0) ?? 0;

  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body">
        <div className="d-flex align-items-center gap-3">
          <div className="flex-grow-1 min-w-0">
            <div className="fw-semibold text-truncate">{quiz.name}</div>
            <div className="text-muted small">
              <i className="bi bi-key me-1" />{quiz.tokens?.length ?? 0} {t('quiz.keys')}
              <span className="mx-2">·</span>
              <i className="bi bi-people me-1" />{totalResponses} {t('quiz.responses')}
            </div>
          </div>
          <div className="d-flex gap-2 flex-shrink-0">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setExpanded((v) => !v)}
              title={t('quiz.manageKeys')}
            >
              <i className={`bi bi-${expanded ? 'chevron-up' : 'key'}`} />
              {!expanded && <span className="ms-1 d-none d-md-inline">{t('quiz.keys')}</span>}
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleClone}
              disabled={cloning}
              title={t('quiz.clone')}
            >
              <i className="bi bi-files" />
            </button>
            <Link
              to={`/add-quiz?id=${quiz.id}`}
              className="btn btn-outline-primary btn-sm"
              title={t('common.edit')}
            >
              <i className="bi bi-pencil" />
            </Link>
            <button
              className="btn btn-outline-danger btn-sm"
              title={t('common.delete')}
              disabled={deleting}
              onClick={handleDelete}
            >
              <i className="bi bi-trash" />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-top">
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-semibold small text-muted">{t('quiz.accessKeys')}</span>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setCreatingKey((v) => !v)}
              >
                <i className="bi bi-plus me-1" />{t('quiz.createKey')}
              </button>
            </div>

            {creatingKey && (
              <div className="d-flex gap-2 mb-3">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder={t('quiz.keyDescriptionPlaceholder')}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
                  autoFocus
                />
                <button
                  className="btn btn-sm btn-primary flex-shrink-0"
                  onClick={handleCreateKey}
                  disabled={creatingToken}
                >
                  {creatingToken
                    ? <span className="spinner-border spinner-border-sm" />
                    : t('common.save')}
                </button>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setCreatingKey(false)}>
                  <i className="bi bi-x" />
                </button>
              </div>
            )}

            {!quiz.tokens?.length ? (
              <p className="text-muted small mb-0">{t('quiz.noKeys')}</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>{t('quiz.keyToken')}</th>
                      <th>{t('quiz.keyDescription')}</th>
                      <th>{t('quiz.status')}</th>
                      <th>{t('quiz.keyResponses')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quiz.tokens.map((token) => (
                      <KeyRow
                        key={token.id}
                        quizId={quiz.id}
                        token={token}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReviewPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const { data: quizzes, isLoading } = useGetMyQuizzesQuery();

  const filtered = quizzes?.filter((q) =>
    q.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">{t('review.title')}</h2>
        <Link to="/add-quiz" className="btn btn-primary">
          <i className="bi bi-plus me-2" />{t('review.addQuiz')}
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

      <div>
        {filtered?.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>
    </div>
  );
}
