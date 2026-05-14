import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { quizService } from '@/services/quiz.service';
import { aiService } from '@/services/ai.service';
import { questionBankService } from '@/services/questionBank.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Quiz, Question, Option, QuestionTypeId } from '@/models';
import { QUESTION_TYPE_LABELS } from '@/models';

// ─── Helpers ────────────────────────────────────────────────────────────────

const emptyOption = (): Option => ({ name: '', isAnswer: 0 });

const emptyQuestion = (): Question => ({
  name: '',
  questionTypeId: 1,
  score: 1,
  options: [emptyOption(), emptyOption()],
  answerText: '',
});

const emptyQuiz = (): Quiz => ({
  name: '',
  description: '',
  allowBack: true,
  allowReview: false,
  autoMove: false,
  duration: 0,
  requiredAll: false,
  shuffleQuestions: false,
  shuffleOptions: true,
  showClock: true,
  showPager: false,
  isPublic: false,
  questionTimeLimit: 0,
  notifyOnCompletion: false,
  questions: [emptyQuestion()],
});

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, '').trim();

// ─── Sub-components ─────────────────────────────────────────────────────────

interface OptionsEditorProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

function SingleMultipleOptions({ question, onUpdate, t }: OptionsEditorProps) {
  const isRadio = question.questionTypeId === 1;

  const updateOption = (idx: number, updates: Partial<Option>) => {
    const options = [...question.options];
    options[idx] = { ...options[idx], ...updates };
    if (updates.isAnswer === 1 && isRadio) {
      options.forEach((o, i) => { if (i !== idx) o.isAnswer = 0; });
    }
    onUpdate({ options });
  };

  const removeOption = (idx: number) => {
    if (question.options.length <= 2) return;
    onUpdate({ options: question.options.filter((_, i) => i !== idx) });
  };

  const addOption = () => onUpdate({ options: [...question.options, emptyOption()] });

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{t('addTest.options')}</label>
      <div className="d-flex flex-column gap-2">
        {question.options.map((opt, oIdx) => (
          <div key={oIdx} className="d-flex align-items-center gap-2">
            <input
              type={isRadio ? 'radio' : 'checkbox'}
              className="form-check-input mt-0 flex-shrink-0"
              checked={opt.isAnswer === 1}
              onChange={(e) => updateOption(oIdx, { isAnswer: e.target.checked ? 1 : 0 })}
              title={t('addTest.markCorrect')}
            />
            <input
              type="text"
              className="form-control"
              value={opt.name}
              onChange={(e) => updateOption(oIdx, { name: e.target.value })}
              placeholder={`${t('addTest.option')} ${oIdx + 1}`}
            />
            <button
              className="btn btn-outline-danger btn-sm flex-shrink-0"
              onClick={() => removeOption(oIdx)}
              disabled={question.options.length <= 2}
              type="button"
            >
              <i className="bi bi-x" />
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn-outline-secondary btn-sm mt-2" onClick={addOption} type="button">
        <i className="bi bi-plus me-1" />{t('addTest.addOption')}
      </button>
    </div>
  );
}

function FillBlankOptions({ question, onUpdate, t }: OptionsEditorProps) {
  const updateAnswer = (idx: number, rightAnswer: string) => {
    const options = [...question.options];
    options[idx] = { ...options[idx], rightAnswer, isAnswer: idx + 1, name: options[idx].name || `Blank ${idx + 1}` };
    onUpdate({ options });
  };

  const addBlank = () => {
    const idx = question.options.length;
    onUpdate({ options: [...question.options, { name: `Blank ${idx + 1}`, isAnswer: idx + 1, rightAnswer: '' }] });
  };

  const removeBlank = (idx: number) => {
    if (question.options.length <= 1) return;
    const options = question.options.filter((_, i) => i !== idx).map((o, i) => ({
      ...o, isAnswer: i + 1, name: `Blank ${i + 1}`,
    }));
    onUpdate({ options });
  };

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{t('addTest.expectedAnswer')}</label>
      <div className="text-muted small mb-2">
        <i className="bi bi-info-circle me-1" />
        Add one expected answer per blank. Students must type the exact text.
      </div>
      <div className="d-flex flex-column gap-2">
        {question.options.map((opt, oIdx) => (
          <div key={oIdx} className="d-flex align-items-center gap-2">
            <span className="badge bg-secondary flex-shrink-0" style={{ minWidth: 28 }}>{oIdx + 1}</span>
            <input
              type="text"
              className="form-control"
              value={opt.rightAnswer ?? ''}
              onChange={(e) => updateAnswer(oIdx, e.target.value)}
              placeholder={`${t('addTest.expectedAnswerPlaceholder')} ${oIdx + 1}`}
            />
            <button
              className="btn btn-outline-danger btn-sm flex-shrink-0"
              onClick={() => removeBlank(oIdx)}
              disabled={question.options.length <= 1}
              type="button"
            >
              <i className="bi bi-x" />
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn-outline-secondary btn-sm mt-2" onClick={addBlank} type="button">
        <i className="bi bi-plus me-1" />Add blank
      </button>
    </div>
  );
}

function OrderingOptions({ question, onUpdate, t }: OptionsEditorProps) {
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const options = [...question.options];
    [options[idx - 1], options[idx]] = [options[idx], options[idx - 1]];
    const reordered = options.map((o, i) => ({ ...o, isAnswer: i + 1 }));
    onUpdate({ options: reordered });
  };

  const moveDown = (idx: number) => {
    if (idx === question.options.length - 1) return;
    const options = [...question.options];
    [options[idx], options[idx + 1]] = [options[idx + 1], options[idx]];
    const reordered = options.map((o, i) => ({ ...o, isAnswer: i + 1 }));
    onUpdate({ options: reordered });
  };

  const updateName = (idx: number, name: string) => {
    const options = [...question.options];
    options[idx] = { ...options[idx], name };
    onUpdate({ options });
  };

  const addItem = () => {
    const idx = question.options.length;
    onUpdate({ options: [...question.options, { name: '', isAnswer: idx + 1 }] });
  };

  const removeItem = (idx: number) => {
    if (question.options.length <= 2) return;
    const options = question.options.filter((_, i) => i !== idx).map((o, i) => ({ ...o, isAnswer: i + 1 }));
    onUpdate({ options });
  };

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{t('addTest.options')}</label>
      <div className="text-muted small mb-2">
        <i className="bi bi-info-circle me-1" />
        Arrange items in the correct order. Students will drag to reorder.
      </div>
      <div className="d-flex flex-column gap-2">
        {question.options.map((opt, oIdx) => (
          <div key={oIdx} className="d-flex align-items-center gap-2">
            <span className="badge bg-primary flex-shrink-0" style={{ minWidth: 28 }}>{oIdx + 1}</span>
            <input
              type="text"
              className="form-control"
              value={opt.name}
              onChange={(e) => updateName(oIdx, e.target.value)}
              placeholder={`Item ${oIdx + 1}`}
            />
            <div className="d-flex flex-column gap-1 flex-shrink-0">
              <button className="btn btn-outline-secondary btn-sm py-0 px-1" onClick={() => moveUp(oIdx)} disabled={oIdx === 0} type="button">
                <i className="bi bi-chevron-up small" />
              </button>
              <button className="btn btn-outline-secondary btn-sm py-0 px-1" onClick={() => moveDown(oIdx)} disabled={oIdx === question.options.length - 1} type="button">
                <i className="bi bi-chevron-down small" />
              </button>
            </div>
            <button
              className="btn btn-outline-danger btn-sm flex-shrink-0"
              onClick={() => removeItem(oIdx)}
              disabled={question.options.length <= 2}
              type="button"
            >
              <i className="bi bi-x" />
            </button>
          </div>
        ))}
      </div>
      <button className="btn btn-outline-secondary btn-sm mt-2" onClick={addItem} type="button">
        <i className="bi bi-plus me-1" />{t('addTest.addOption')}
      </button>
    </div>
  );
}

function MatchingOptions({ question, onUpdate, t }: OptionsEditorProps) {
  const updateOption = (idx: number, updates: Partial<Option>) => {
    const options = [...question.options];
    options[idx] = { ...options[idx], ...updates };
    onUpdate({ options });
  };

  const addPair = () => {
    const idx = question.options.length + 1;
    onUpdate({ options: [...question.options, { name: '', rightAnswer: '', isAnswer: idx }] });
  };

  const removePair = (idx: number) => {
    if (question.options.length <= 2) return;
    onUpdate({ options: question.options.filter((_, i) => i !== idx) });
  };

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{t('addTest.options')}</label>
      <div className="text-muted small mb-2">
        <i className="bi bi-info-circle me-1" />
        Enter pairs: left item and its matching right answer.
      </div>
      <div className="row g-1 mb-1">
        <div className="col-5"><small className="text-muted fw-semibold">Left (prompt)</small></div>
        <div className="col-5"><small className="text-muted fw-semibold">Right (match)</small></div>
        <div className="col-2" />
      </div>
      {question.options.map((opt, oIdx) => (
        <div key={oIdx} className="row g-1 mb-2 align-items-center">
          <div className="col-5">
            <input
              type="text"
              className="form-control form-control-sm"
              value={opt.name}
              onChange={(e) => updateOption(oIdx, { name: e.target.value })}
              placeholder={`Left ${oIdx + 1}`}
            />
          </div>
          <div className="col-5">
            <input
              type="text"
              className="form-control form-control-sm"
              value={opt.rightAnswer ?? ''}
              onChange={(e) => updateOption(oIdx, { rightAnswer: e.target.value, isAnswer: oIdx + 1 })}
              placeholder={`Match ${oIdx + 1}`}
            />
          </div>
          <div className="col-2">
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => removePair(oIdx)}
              disabled={question.options.length <= 2}
              type="button"
            >
              <i className="bi bi-x" />
            </button>
          </div>
        </div>
      ))}
      <button className="btn btn-outline-secondary btn-sm mt-1" onClick={addPair} type="button">
        <i className="bi bi-plus me-1" />Add pair
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

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

  // AI generation
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Question bank
  const [showBankPanel, setShowBankPanel] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSaving, setBankSaving] = useState<Set<number>>(new Set());

  // Drag-and-drop
  const dragIdx = useRef<number | null>(null);

  // ─── Load quiz ────────────────────────────────────────────────────
  useEffect(() => {
    if (quizId) {
      setLoading(true);
      quizService.getQuiz(Number(quizId))
        .then((q) => {
          setQuiz(q);
          // backend returns duration in seconds; display as minutes
          setDurationMinutes(q.duration > 0 ? Math.round(q.duration / 60) : 0);
        })
        .catch(() => toast.error(t('addTest.loadError')))
        .finally(() => setLoading(false));
    }
  }, [quizId, t]);

  // ─── Quiz updaters ────────────────────────────────────────────────
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
    setActiveIdx((i) => Math.min(Math.max(0, i >= idx ? i - 1 : i), quiz.questions.length - 2));
  };

  const handleTypeChange = (typeId: QuestionTypeId) => {
    const q = quiz.questions[activeIdx];
    let options: Option[] = q.options;

    if (typeId === 4) {
      options = [];
    } else if (typeId === 3) {
      // fill-blank: keep existing or start with one blank
      options = options.length ? options.map((o, i) => ({ ...o, isAnswer: i + 1, rightAnswer: o.rightAnswer ?? '' })) : [{ name: 'Blank 1', isAnswer: 1, rightAnswer: '' }];
    } else if (typeId === 5) {
      // ordering: assign positional isAnswer
      options = options.length ? options.map((o, i) => ({ ...o, isAnswer: i + 1 })) : [emptyOption(), emptyOption()];
      options = options.map((o, i) => ({ ...o, isAnswer: i + 1 }));
    } else if (typeId === 6) {
      // matching: name + rightAnswer pairs
      options = options.length ? options : [{ name: '', rightAnswer: '', isAnswer: 1 }, { name: '', rightAnswer: '', isAnswer: 2 }];
    } else {
      options = options.length ? options.map((o) => ({ ...o, rightAnswer: undefined })) : [emptyOption(), emptyOption()];
    }

    updateQuestion(activeIdx, { questionTypeId: typeId, options });
  };

  // ─── Drag-and-drop reordering ─────────────────────────────────────
  const handleDragStart = (_e: React.DragEvent, idx: number) => {
    dragIdx.current = idx;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    const fromIdx = dragIdx.current;
    if (fromIdx === null || fromIdx === toIdx) return;
    setQuiz((q) => {
      const qs = [...q.questions];
      const [moved] = qs.splice(fromIdx, 1);
      qs.splice(toIdx, 0, moved);
      return { ...q, questions: qs };
    });
    setActiveIdx(toIdx);
    dragIdx.current = null;
  };

  // ─── AI generation ────────────────────────────────────────────────
  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) { toast.error(t('addTest.aiTopicRequired')); return; }
    setGenerating(true);
    try {
      const result = await aiService.generateQuiz(aiTopic, aiCount);
      const newQuestions: Question[] = (result.questions ?? []).map((q: Question) => ({
        name: q.name,
        questionTypeId: (q.questionTypeId as QuestionTypeId) || 1,
        score: q.score || 1,
        options: (q.options ?? []).map((o: Option) => ({ name: o.name, isAnswer: o.isAnswer ?? 0 })),
        answerText: '',
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

  // ─── Question bank ────────────────────────────────────────────────
  const loadBank = async () => {
    setBankLoading(true);
    try {
      const data = await questionBankService.getQuestionBank();
      setBankQuestions(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load question bank.');
    } finally {
      setBankLoading(false);
    }
  };

  const toggleBankPanel = () => {
    const next = !showBankPanel;
    setShowBankPanel(next);
    if (next && bankQuestions.length === 0) loadBank();
  };

  const importFromBank = (bq: Question) => {
    const imported: Question = { ...bq, id: undefined };
    setQuiz((q) => ({ ...q, questions: [...q.questions, imported] }));
    setActiveIdx(quiz.questions.length);
    toast.success('Question imported.');
  };

  const saveToBank = async (idx: number) => {
    setBankSaving((s) => new Set(s).add(idx));
    try {
      await questionBankService.saveQuestion(quiz.questions[idx]);
      toast.success('Question saved to bank.');
    } catch {
      toast.error('Failed to save to bank.');
    } finally {
      setBankSaving((s) => { const ns = new Set(s); ns.delete(idx); return ns; });
    }
  };

  // ─── Save ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!quiz.name.trim()) { toast.error(t('addTest.titleRequired')); return; }
    if (quiz.questions.length === 0) { toast.error('Add at least one question.'); return; }

    setSaving(true);
    try {
      // Send duration in minutes (backend converts to seconds internally)
      const payload: Partial<Quiz> = {
        ...quiz,
        duration: durationMinutes,
        id: quizId ? Number(quizId) : 0,
      };
      const { qid } = await quizService.saveQuiz(payload);
      toast.success(t('addTest.saved'));
      if (!quizId || Number(quizId) <= 0) {
        // New quiz — navigate to same page with the assigned ID
        navigate(`/add-quiz?id=${qid}`);
      } else {
        // Reload after saving existing
        quizService.getQuiz(Number(quizId)).then((q) => {
          setQuiz(q);
          setDurationMinutes(q.duration > 0 ? Math.round(q.duration / 60) : 0);
        });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || t('addTest.saveError'));
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner fullScreen />;

  const activeQ = quiz.questions[activeIdx] ?? quiz.questions[0];
  const typeId = activeQ?.questionTypeId ?? 1;

  const SETTINGS_TOGGLES: { key: keyof Quiz; label: string }[] = [
    { key: 'shuffleQuestions', label: t('addTest.shuffleQ') },
    { key: 'shuffleOptions',   label: t('addTest.shuffleO') },
    { key: 'allowBack',        label: t('addTest.allowBack') },
    { key: 'allowReview',      label: t('addTest.allowReview') },
    { key: 'autoMove',         label: t('addTest.autoMove') },
    { key: 'requiredAll',      label: t('addTest.requiredAll') },
    { key: 'showClock',        label: t('addTest.showClock') },
    { key: 'showPager',        label: t('addTest.showPager') },
    { key: 'isPublic',         label: t('addTest.public') },
    { key: 'notifyOnCompletion', label: t('addTest.notifyOnCompletion') },
  ];

  return (
    <div>
      {/* ── Header ── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          {quizId ? t('addTest.editTitle') : t('addTest.newTitle')}
        </h2>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className={`btn btn-sm ${showBankPanel ? 'btn-secondary' : 'btn-outline-secondary'}`}
            onClick={toggleBankPanel}
            type="button"
          >
            <i className="bi bi-bank me-1" />Bank
            {bankQuestions.length > 0 && (
              <span className="badge bg-light text-dark ms-1">{bankQuestions.length}</span>
            )}
          </button>
          <button
            className={`btn btn-sm ${showAiPanel ? 'btn-secondary' : 'btn-outline-secondary'}`}
            onClick={() => setShowAiPanel((v) => !v)}
            type="button"
          >
            <i className="bi bi-robot me-1" />{t('addTest.aiGenerate')}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving} type="button">
            {saving && <span className="spinner-border spinner-border-sm me-2" />}
            <i className="bi bi-floppy me-1" />{t('common.save')}
          </button>
        </div>
      </div>

      {/* ── AI Panel ── */}
      {showAiPanel && (
        <div className="card border-primary shadow-sm mb-4">
          <div className="card-body p-3">
            <h6 className="fw-semibold mb-3 text-primary">
              <i className="bi bi-robot me-2" />{t('addTest.aiGenerate')}
            </h6>
            <div className="row g-2 align-items-end">
              <div className="col-md-6">
                <label className="form-label small mb-1">{t('addTest.aiTopic')}</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder={t('addTest.aiTopicPlaceholder')}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small mb-1">{t('addTest.aiCount')}</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  min={1}
                  max={20}
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                />
              </div>
              <div className="col-md-3">
                <button className="btn btn-primary btn-sm w-100" onClick={handleAiGenerate} disabled={generating} type="button">
                  {generating
                    ? <><span className="spinner-border spinner-border-sm me-1" />{t('addTest.generating')}</>
                    : <><i className="bi bi-stars me-1" />{t('addTest.generate')}</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Question Bank Panel ── */}
      {showBankPanel && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
            <span className="fw-semibold small"><i className="bi bi-bank me-2" />Question Bank</span>
            <button className="btn btn-link btn-sm p-0" onClick={loadBank} type="button">
              <i className="bi bi-arrow-clockwise" />
            </button>
          </div>
          <div className="card-body p-2" style={{ maxHeight: 220, overflowY: 'auto' }}>
            {bankLoading && <div className="text-center py-3"><span className="spinner-border spinner-border-sm" /></div>}
            {!bankLoading && bankQuestions.length === 0 && (
              <p className="text-muted text-center small py-2 mb-0">No questions saved in bank yet.</p>
            )}
            {bankQuestions.map((bq, bi) => (
              <div key={bi} className="d-flex align-items-center gap-2 py-1 border-bottom">
                <span className="badge bg-secondary small flex-shrink-0">{QUESTION_TYPE_LABELS[bq.questionTypeId]?.split(' ')[0]}</span>
                <span className="text-truncate small flex-grow-1">{stripHtml(bq.name) || 'Untitled'}</span>
                <button className="btn btn-sm btn-outline-primary flex-shrink-0" onClick={() => importFromBank(bq)} type="button">
                  <i className="bi bi-plus" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quiz settings ── */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-6 col-lg-7">
              <label className="form-label fw-semibold small mb-1">{t('addTest.quizTitle')} *</label>
              <input
                type="text"
                className="form-control"
                value={quiz.name}
                onChange={(e) => updateQuiz({ name: e.target.value })}
                placeholder={t('addTest.titlePlaceholder')}
              />
            </div>
            <div className="col-md-3 col-lg-2">
              <label className="form-label fw-semibold small mb-1">
                {t('addTest.duration')}
                <span className="text-muted fw-normal ms-1 small">({t('addTest.durationHelp')})</span>
              </label>
              <input
                type="number"
                className="form-control"
                min={0}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>
            <div className="col-md-3 col-lg-3">
              <label className="form-label fw-semibold small mb-1">
                {t('addTest.questionTimeLimit')}
                <span className="text-muted fw-normal ms-1 small">(sec, 0=none)</span>
              </label>
              <input
                type="number"
                className="form-control"
                min={0}
                value={quiz.questionTimeLimit ?? 0}
                onChange={(e) => updateQuiz({ questionTimeLimit: Number(e.target.value) })}
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold small mb-1">{t('addTest.description')}</label>
              <textarea
                className="form-control"
                rows={2}
                value={quiz.description}
                onChange={(e) => updateQuiz({ description: e.target.value })}
              />
            </div>
            <div className="col-12">
              <div className="d-flex flex-wrap gap-3">
                {SETTINGS_TOGGLES.map(({ key, label }) => (
                  <div key={key} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`setting-${key}`}
                      checked={!!quiz[key]}
                      onChange={(e) => updateQuiz({ [key]: e.target.checked } as Partial<Quiz>)}
                    />
                    <label className="form-check-label small" htmlFor={`setting-${key}`}>{label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Questions area ── */}
      <div className="row g-4">
        {/* Question list */}
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-2">
              <span className="fw-semibold small">
                {t('addTest.questions')} ({quiz.questions.length})
              </span>
            </div>
            <div className="list-group list-group-flush" style={{ maxHeight: 480, overflowY: 'auto' }}>
              {quiz.questions.map((q, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={(e) => handleDragStart(e, i)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, i)}
                  role="button"
                  tabIndex={0}
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 py-2 ${i === activeIdx ? 'active' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveIdx(i)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveIdx(i)}
                >
                  <i className="bi bi-grip-vertical text-muted flex-shrink-0" style={{ cursor: 'grab', opacity: 0.5 }} />
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex align-items-center gap-1 mb-0">
                      <span className="small fw-semibold">{i + 1}.</span>
                      <span className="text-truncate small">{stripHtml(q.name) || t('addTest.untitled')}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <span className={`badge small ${i === activeIdx ? 'bg-light text-dark' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                        {QUESTION_TYPE_LABELS[q.questionTypeId]}
                      </span>
                      <span className={`small ${i === activeIdx ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}>
                        {q.score}pt
                      </span>
                    </div>
                  </div>
                  <div className="d-flex gap-1 flex-shrink-0">
                    <button
                      className={`btn btn-sm py-0 px-1 ${i === activeIdx ? 'btn-outline-light' : 'btn-outline-secondary'}`}
                      onClick={(e) => { e.stopPropagation(); saveToBank(i); }}
                      disabled={bankSaving.has(i)}
                      title="Save to bank"
                      type="button"
                    >
                      {bankSaving.has(i)
                        ? <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12 }} />
                        : <i className="bi bi-bookmark" style={{ fontSize: '0.75rem' }} />
                      }
                    </button>
                    <button
                      className={`btn btn-sm py-0 px-1 ${i === activeIdx ? 'btn-outline-light' : 'btn-outline-danger'}`}
                      onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                      disabled={quiz.questions.length <= 1}
                      type="button"
                    >
                      <i className="bi bi-trash" style={{ fontSize: '0.75rem' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer bg-transparent py-2">
              <button className="btn btn-primary btn-sm w-100" onClick={addQuestion} type="button">
                <i className="bi bi-plus me-1" />{t('addTest.addQuestion')}
              </button>
            </div>
          </div>
        </div>

        {/* Question editor */}
        <div className="col-md-9">
          {activeQ ? (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent d-flex justify-content-between align-items-center py-2">
                <span className="fw-semibold text-muted small">
                  {t('addTest.question')} {activeIdx + 1} / {quiz.questions.length}
                </span>
                <span className="badge bg-body-secondary text-body small">
                  {QUESTION_TYPE_LABELS[typeId]}
                </span>
              </div>
              <div className="card-body p-3">

                {/* Question text */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small">{t('addTest.questionText')}</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={activeQ.name}
                    onChange={(e) => updateQuestion(activeIdx, { name: e.target.value })}
                    placeholder={t('addTest.questionPlaceholder')}
                  />
                </div>

                {/* Type + Score row */}
                <div className="row g-3 mb-3">
                  <div className="col-md-7">
                    <label className="form-label fw-semibold small">{t('addTest.type')}</label>
                    <select
                      className="form-select form-select-sm"
                      value={typeId}
                      onChange={(e) => handleTypeChange(Number(e.target.value) as QuestionTypeId)}
                    >
                      {([1, 2, 3, 4, 5, 6] as QuestionTypeId[]).map((id) => (
                        <option key={id} value={id}>{id} — {QUESTION_TYPE_LABELS[id]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-5">
                    <label className="form-label fw-semibold small">{t('addTest.score')}</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min={0}
                      step={0.5}
                      value={activeQ.score}
                      onChange={(e) => updateQuestion(activeIdx, { score: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Type-specific options */}
                {(typeId === 1 || typeId === 2) && (
                  <SingleMultipleOptions
                    question={activeQ}
                    onUpdate={(u) => updateQuestion(activeIdx, u)}
                    t={t}
                  />
                )}

                {typeId === 3 && (
                  <FillBlankOptions
                    question={activeQ}
                    onUpdate={(u) => updateQuestion(activeIdx, u)}
                    t={t}
                  />
                )}

                {typeId === 4 && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">{t('addTest.expectedAnswer')}</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={activeQ.answerText ?? ''}
                      onChange={(e) => updateQuestion(activeIdx, { answerText: e.target.value })}
                      placeholder={t('addTest.expectedAnswerPlaceholder')}
                    />
                  </div>
                )}

                {typeId === 5 && (
                  <OrderingOptions
                    question={activeQ}
                    onUpdate={(u) => updateQuestion(activeIdx, u)}
                    t={t}
                  />
                )}

                {typeId === 6 && (
                  <MatchingOptions
                    question={activeQ}
                    onUpdate={(u) => updateQuestion(activeIdx, u)}
                    t={t}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center text-muted py-5">
                <i className="bi bi-question-circle fs-1 mb-3 d-block" />
                <p>No question selected. Add a question to start editing.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
