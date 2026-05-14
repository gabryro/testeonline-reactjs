import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { QUESTION_TYPE_LABELS } from '@/models';
import type { Question } from '@/models';
import { useGetQuestionBankQuery, useDeleteQuestionMutation } from '@/store/api/questionBankApi';

export function QuestionBankPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const { data: questions, isLoading } = useGetQuestionBankQuery();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const handleDelete = (id: number) => {
    if (confirm(t('questionBank.confirmDelete'))) {
      deleteQuestion(id)
        .unwrap()
        .then(() => toast.success(t('questionBank.deleted')))
        .catch(() => toast.error(t('questionBank.deleteError')));
    }
  };

  const filtered = questions?.filter((q: Question) =>
    q.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="fw-bold mb-4">{t('questionBank.title')}</h2>

      <div className="mb-3">
        <input
          type="search"
          className="form-control"
          placeholder={t('questionBank.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && !filtered?.length && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-bank display-4 d-block mb-3" />
          <p>{t('questionBank.empty')}</p>
        </div>
      )}

      <div className="d-flex flex-column gap-2">
        {filtered?.map((q: Question) => (
          <div key={q.id} className="card border-0 shadow-sm">
            <div className="card-body d-flex align-items-start gap-3">
              <div className="flex-grow-1">
                <div className="fw-semibold">{q.name}</div>
                <div className="text-muted small">
                  {QUESTION_TYPE_LABELS[q.questionTypeId]} &bull; {q.options?.length ?? 0} {t('quiz.options')}
                </div>
              </div>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDelete(q.id!)}
              >
                <i className="bi bi-trash" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
