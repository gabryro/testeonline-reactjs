import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { quizService } from '@/services/quiz.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Quiz, Question, Option } from '@/models';

const emptyOption = (): Option => ({ text: '', isCorrect: false });
const emptyQuestion = (): Question => ({
  text: '',
  type: 'single',
  options: [emptyOption(), emptyOption()],
  points: 1,
});
const emptyQuiz = (): Quiz => ({
  title: '',
  description: '',
  isPublic: false,
  questions: [emptyQuestion()],
  config: {
    shuffleQuestions: false,
    shuffleOptions: false,
    showResults: true,
    showCorrectAnswers: true,
  },
});

export function AddTestPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const quizId = params.get('id');
  const [quiz, setQuiz] = useState<Quiz>(emptyQuiz());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  useEffect(() => {
    if (quizId) {
      setLoading(true);
      // Load existing quiz - would use a getQuiz endpoint
      // For now use the quizzes list and find by id
      quizService.getMyQuizzes().then((quizzes) => {
        const found = quizzes.find((q) => q.id === quizId);
        if (found) setQuiz({ ...emptyQuiz(), ...found });
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [quizId]);

  const updateQuiz = useCallback((updates: Partial<Quiz>) => {
    setQuiz((q) => ({ ...q, ...updates }));
  }, []);

  const updateQuestion = useCallback((idx: number, updates: Partial<Question>) => {
    setQuiz((q) => {
      const questions = [...q.questions];
      questions[idx] = { ...questions[idx], ...updates };
      return { ...q, questions };
    });
  }, []);

  const addQuestion = () => {
    setQuiz((q) => ({ ...q, questions: [...q.questions, emptyQuestion()] }));
    setActiveQuestionIdx(quiz.questions.length);
  };

  const removeQuestion = (idx: number) => {
    if (quiz.questions.length <= 1) return;
    setQuiz((q) => ({
      ...q,
      questions: q.questions.filter((_, i) => i !== idx),
    }));
    setActiveQuestionIdx(Math.max(0, idx - 1));
  };

  const addOption = (qIdx: number) => {
    updateQuestion(qIdx, { options: [...quiz.questions[qIdx].options, emptyOption()] });
  };

  const updateOption = (qIdx: number, oIdx: number, updates: Partial<Option>) => {
    const options = [...quiz.questions[qIdx].options];
    options[oIdx] = { ...options[oIdx], ...updates };
    // For single-choice, deselect other options when one is selected
    if (updates.isCorrect && quiz.questions[qIdx].type === 'single') {
      options.forEach((o, i) => { if (i !== oIdx) o.isCorrect = false; });
    }
    updateQuestion(qIdx, { options });
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    const options = quiz.questions[qIdx].options.filter((_, i) => i !== oIdx);
    updateQuestion(qIdx, { options });
  };

  const handleSave = async () => {
    if (!quiz.title.trim()) { toast.error(t('addTest.titleRequired')); return; }
    setSaving(true);
    try {
      const result = await quizService.saveQuiz(quiz);
      toast.success(t('addTest.saved'));
      navigate(`/quiz-review`);
      void result;
    } catch {
      toast.error(t('addTest.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const activeQ = quiz.questions[activeQuestionIdx];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">{quizId ? t('addTest.editTitle') : t('addTest.newTitle')}</h2>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving && <span className="spinner-border spinner-border-sm me-2" />}
          {t('common.save')}
        </button>
      </div>

      <div className="row g-4">
        {/* Quiz Settings */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">{t('addTest.quizTitle')}</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={quiz.title}
                    onChange={(e) => updateQuiz({ title: e.target.value })}
                    placeholder={t('addTest.titlePlaceholder')}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">{t('addTest.subject')}</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={quiz.subject || ''}
                    onChange={(e) => updateQuiz({ subject: e.target.value })}
                    placeholder={t('addTest.subjectPlaceholder')}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">{t('addTest.description')}</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={quiz.description || ''}
                    onChange={(e) => updateQuiz({ description: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <div className="d-flex flex-wrap gap-3">
                    {[
                      { key: 'isPublic', label: t('addTest.public') },
                      { key: 'shuffleQuestions', label: t('addTest.shuffleQ'), config: true },
                      { key: 'shuffleOptions', label: t('addTest.shuffleO'), config: true },
                      { key: 'showResults', label: t('addTest.showResults'), config: true },
                      { key: 'showCorrectAnswers', label: t('addTest.showAnswers'), config: true },
                    ].map(({ key, label, config }) => (
                      <div key={key} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={key}
                          checked={config ? !!(quiz.config as unknown as Record<string, unknown>)?.[key] : !!(quiz as unknown as Record<string, unknown>)[key]}
                          onChange={(e) => {
                            if (config) updateQuiz({ config: { ...quiz.config, [key]: e.target.checked } });
                            else updateQuiz({ [key]: e.target.checked } as Partial<Quiz>);
                          }}
                        />
                        <label className="form-check-label" htmlFor={key}>{label}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question list */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent fw-semibold">
              {t('addTest.questions')} ({quiz.questions.length})
            </div>
            <div className="list-group list-group-flush">
              {quiz.questions.map((q, i) => (
                <button
                  key={i}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${i === activeQuestionIdx ? 'active' : ''}`}
                  onClick={() => setActiveQuestionIdx(i)}
                >
                  <span className="text-truncate small" style={{ maxWidth: 140 }}>
                    {i + 1}. {q.text || t('addTest.untitled')}
                  </span>
                  <button
                    className={`btn btn-sm ${i === activeQuestionIdx ? 'btn-outline-light' : 'btn-outline-danger'}`}
                    onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </button>
              ))}
            </div>
            <div className="card-footer bg-transparent">
              <button className="btn btn-primary btn-sm w-100" onClick={addQuestion}>
                <i className="bi bi-plus me-1" />{t('addTest.addQuestion')}
              </button>
            </div>
          </div>
        </div>

        {/* Question editor */}
        <div className="col-md-9">
          {activeQ && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex gap-3 mb-3">
                  <div className="flex-grow-1">
                    <label className="form-label fw-semibold">{t('addTest.questionText')}</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={activeQ.text}
                      onChange={(e) => updateQuestion(activeQuestionIdx, { text: e.target.value })}
                    />
                  </div>
                  <div style={{ width: 150 }}>
                    <label className="form-label fw-semibold">{t('addTest.type')}</label>
                    <select
                      className="form-select"
                      value={activeQ.type}
                      onChange={(e) => updateQuestion(activeQuestionIdx, { type: e.target.value as Question['type'] })}
                    >
                      <option value="single">{t('addTest.single')}</option>
                      <option value="multiple">{t('addTest.multiple')}</option>
                      <option value="text">{t('addTest.textAnswer')}</option>
                    </select>
                  </div>
                </div>

                {activeQ.type !== 'text' && (
                  <div>
                    <label className="form-label fw-semibold">{t('addTest.options')}</label>
                    <div className="d-flex flex-column gap-2">
                      {activeQ.options.map((opt, oIdx) => (
                        <div key={oIdx} className="d-flex align-items-center gap-2">
                          <input
                            type={activeQ.type === 'single' ? 'radio' : 'checkbox'}
                            className="form-check-input mt-0 flex-shrink-0"
                            checked={opt.isCorrect}
                            onChange={(e) => updateOption(activeQuestionIdx, oIdx, { isCorrect: e.target.checked })}
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={opt.text}
                            onChange={(e) => updateOption(activeQuestionIdx, oIdx, { text: e.target.value })}
                            placeholder={`${t('addTest.option')} ${oIdx + 1}`}
                          />
                          <button
                            className="btn btn-outline-danger btn-sm flex-shrink-0"
                            onClick={() => removeOption(activeQuestionIdx, oIdx)}
                            disabled={activeQ.options.length <= 2}
                          >
                            <i className="bi bi-x" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-outline-secondary btn-sm mt-2" onClick={() => addOption(activeQuestionIdx)}>
                      <i className="bi bi-plus me-1" />{t('addTest.addOption')}
                    </button>
                  </div>
                )}

                <div className="mt-3">
                  <label className="form-label fw-semibold">{t('addTest.explanation')}</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={activeQ.explanation || ''}
                    onChange={(e) => updateQuestion(activeQuestionIdx, { explanation: e.target.value })}
                    placeholder={t('addTest.explanationPlaceholder')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
