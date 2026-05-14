import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { quizService } from '@/services/quiz.service';
import { aiService } from '@/services/ai.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Quiz, Question, Option, QuestionTypeId } from '@/models';
import { QUESTION_TYPE_LABELS } from '@/models';

const emptyOption = (): Option => ({ name: '', isAnswer: 0 });
const emptyQuestion = (): Question => ({
  name: '',
  questionTypeId: 1,
  score: 1,
  options: [emptyOption(), emptyOption()],
});
const emptyQuiz = (): Quiz => ({
  name: '',
  description: '',
  allowBack: true,
  allowReview: true,
  autoMove: false,
  durationSecs: 0,
  requiredAll: false,
  shuffleQuestions: false,
  shuffleOptions: false,
  showClock: true,
  showPager: true,
  questions: [emptyQuestion()],
});

export function AddTestPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const quizId = params.get('id');
  const [quiz, setQuiz] = useState<Quiz>(emptyQuiz());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);

  // AI generation state
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  useEffect(() => {
    if (quizId) {
      setLoading(true);
      quizService.getQuiz(Number(quizId))
        .then((q) => {
          setQuiz(q);
          setDurationMinutes(q.durationSecs > 0 ? Math.round(q.durationSecs / 60) : 0);
        })
        .catch(() => toast.error(t('addTest.loadError')))
        .finally(() => setLoading(false));
    }
  }, [quizId, t]);

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
    setActiveIdx(quiz.questions.length);
  };

  const removeQuestion = (idx: number) => {
    if (quiz.questions.length <= 1) return;
    setQuiz((q) => ({ ...q, questions: q.questions.filter((_, i) => i !== idx) }));
    setActiveIdx((i) => Math.max(0, i >= idx ? i - 1 : i));
  };

  const addOption = (qIdx: number) => {
    const options = [...quiz.questions[qIdx].options, emptyOption()];
    updateQuestion(qIdx, { options });
  };

  const updateOption = (qIdx: number, oIdx: number, updates: Partial<Option>) => {
    const options = [...quiz.questions[qIdx].options];
    options[oIdx] = { ...options[oIdx], ...updates };
    if (updates.isAnswer === 1 && quiz.questions[qIdx].questionTypeId === 1) {
      options.forEach((o, i) => { if (i !== oIdx) o.isAnswer = 0; });
    }
    updateQuestion(qIdx, { options });
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    if (quiz.questions[qIdx].options.length <= 2) return;
    updateQuestion(qIdx, {
      options: quiz.questions[qIdx].options.filter((_, i) => i !== oIdx),
    });
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) { toast.error(t('addTest.aiTopicRequired')); return; }
    setGenerating(true);
    try {
      const result = await aiService.generateQuiz(aiTopic, aiCount);
      const newQuestions: Question[] = (result.questions ?? []).map((q) => ({
        name: q.name,
        questionTypeId: (q.questionTypeId as QuestionTypeId) || 1,
        score: q.score || 1,
        options: (q.options ?? []).map((o) => ({ name: o.name, isAnswer: o.isAnswer ?? 0 })),
      }));
      setQuiz((prev) => ({ ...prev, questions: [...prev.questions, ...newQuestions] }));
      toast.success(t('addTest.aiAdded', { count: newQuestions.length }));
      setShowAiPanel(false);
      setAiTopic('');
    } catch {
      toast.error(t('addTest.aiError'));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!quiz.name.trim()) { toast.error(t('addTest.titleRequired')); return; }
    setSaving(true);
    try {
      const payload = { ...quiz, durationSecs: durationMinutes * 60, id: quizId ? Number(quizId) : undefined };
      await quizService.saveQuiz(payload);
      toast.success(t('addTest.saved'));
      navigate('/quiz-review');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || t('addTest.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const activeQ = quiz.questions[activeIdx];
  const isChoiceType = activeQ && activeQ.questionTypeId !== 4;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          {quizId ? t('addTest.editTitle') : t('addTest.newTitle')}
        </h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowAiPanel((v) => !v)}
          >
            <i className="bi bi-robot me-2" />{t('addTest.aiGenerate')}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving && <span className="spinner-border spinner-border-sm me-2" />}
            {t('common.save')}
          </button>
        </div>
      </div>

      {/* AI Panel */}
      {showAiPanel && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h6 className="fw-semibold mb-3">
              <i className="bi bi-robot me-2 text-primary" />{t('addTest.aiGenerate')}
            </h6>
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label">{t('addTest.aiTopic')}</label>
                <input
                  type="text"
                  className="form-control"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder={t('addTest.aiTopicPlaceholder')}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">{t('addTest.aiCount')}</label>
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  max={20}
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                />
              </div>
              <div className="col-md-3">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleAiGenerate}
                  disabled={generating}
                >
                  {generating
                    ? <><span className="spinner-border spinner-border-sm me-2" />{t('addTest.generating')}</>
                    : <><i className="bi bi-stars me-2" />{t('addTest.generate')}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Quiz settings */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">{t('addTest.quizTitle')}</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={quiz.name}
                    onChange={(e) => updateQuiz({ name: e.target.value })}
                    placeholder={t('addTest.titlePlaceholder')}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    {t('addTest.duration')}
                    <span className="text-muted fw-normal ms-1 small">({t('addTest.durationHelp')})</span>
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    min={0}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">{t('addTest.description')}</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={quiz.description}
                    onChange={(e) => updateQuiz({ description: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <div className="d-flex flex-wrap gap-3">
                    {([
                      { key: 'shuffleQuestions', label: t('addTest.shuffleQ') },
                      { key: 'shuffleOptions',   label: t('addTest.shuffleO') },
                      { key: 'allowBack',         label: t('addTest.allowBack') },
                      { key: 'allowReview',       label: t('addTest.allowReview') },
                      { key: 'autoMove',          label: t('addTest.autoMove') },
                      { key: 'requiredAll',       label: t('addTest.requiredAll') },
                      { key: 'showClock',         label: t('addTest.showClock') },
                      { key: 'showPager',         label: t('addTest.showPager') },
                    ] as { key: keyof Quiz; label: string }[]).map(({ key, label }) => (
                      <div key={key} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={key}
                          checked={!!quiz[key]}
                          onChange={(e) => updateQuiz({ [key]: e.target.checked } as Partial<Quiz>)}
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
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <span className="fw-semibold">
                {t('addTest.questions')} ({quiz.questions.length})
              </span>
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: 460, overflowY: 'auto' }}>
              {quiz.questions.map((q, i) => (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 ${i === activeIdx ? 'active' : ''}`}
                  onClick={() => setActiveIdx(i)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveIdx(i)}
                >
                  <span className="text-truncate small" style={{ maxWidth: 130 }}>
                    {i + 1}. {q.name || t('addTest.untitled')}
                  </span>
                  <button
                    className={`btn btn-sm ${i === activeIdx ? 'btn-outline-light' : 'btn-outline-danger'}`}
                    onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                    disabled={quiz.questions.length <= 1}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </div>
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
              <div className="card-header bg-transparent">
                <span className="fw-semibold text-muted small">
                  {t('addTest.question')} {activeIdx + 1}
                </span>
              </div>
              <div className="card-body p-4">
                {/* Question text */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">{t('addTest.questionText')}</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={activeQ.name}
                    onChange={(e) => updateQuestion(activeIdx, { name: e.target.value })}
                    placeholder={t('addTest.questionPlaceholder')}
                  />
                </div>

                {/* Type + Score */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">{t('addTest.type')}</label>
                    <select
                      className="form-select"
                      value={activeQ.questionTypeId}
                      onChange={(e) => {
                        const typeId = Number(e.target.value) as QuestionTypeId;
                        const updates: Partial<Question> = { questionTypeId: typeId };
                        if (typeId === 4) updates.options = [];
                        else if (!activeQ.options.length) updates.options = [emptyOption(), emptyOption()];
                        updateQuestion(activeIdx, updates);
                      }}
                    >
                      {([1, 2, 4] as QuestionTypeId[]).map((id) => (
                        <option key={id} value={id}>{QUESTION_TYPE_LABELS[id]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">{t('addTest.score')}</label>
                    <input
                      type="number"
                      className="form-control"
                      min={0}
                      step={0.5}
                      value={activeQ.score}
                      onChange={(e) => updateQuestion(activeIdx, { score: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Options (for choice types) */}
                {isChoiceType && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">{t('addTest.options')}</label>
                    <div className="d-flex flex-column gap-2">
                      {activeQ.options.map((opt, oIdx) => (
                        <div key={oIdx} className="d-flex align-items-center gap-2">
                          <input
                            type={activeQ.questionTypeId === 1 ? 'radio' : 'checkbox'}
                            className="form-check-input mt-0 flex-shrink-0"
                            checked={opt.isAnswer === 1}
                            onChange={(e) =>
                              updateOption(activeIdx, oIdx, { isAnswer: e.target.checked ? 1 : 0 })
                            }
                            title={t('addTest.markCorrect')}
                          />
                          <input
                            type="text"
                            className="form-control"
                            value={opt.name}
                            onChange={(e) => updateOption(activeIdx, oIdx, { name: e.target.value })}
                            placeholder={`${t('addTest.option')} ${oIdx + 1}`}
                          />
                          <button
                            className="btn btn-outline-danger btn-sm flex-shrink-0"
                            onClick={() => removeOption(activeIdx, oIdx)}
                            disabled={activeQ.options.length <= 2}
                          >
                            <i className="bi bi-x" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn btn-outline-secondary btn-sm mt-2"
                      onClick={() => addOption(activeIdx)}
                    >
                      <i className="bi bi-plus me-1" />{t('addTest.addOption')}
                    </button>
                  </div>
                )}

                {/* Expected answer for text type */}
                {activeQ.questionTypeId === 4 && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">{t('addTest.expectedAnswer')}</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={activeQ.options[0]?.name ?? ''}
                      onChange={(e) =>
                        updateQuestion(activeIdx, {
                          options: [{ name: e.target.value, isAnswer: 1 }],
                        })
                      }
                      placeholder={t('addTest.expectedAnswerPlaceholder')}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
