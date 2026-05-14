import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { quizService } from '@/services/quiz.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Quiz, Question, Option } from '@/models';

type Phase = 'enter-code' | 'enter-name' | 'taking' | 'result';

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function StudentPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('enter-code');
  const [code, setCode] = useState(searchParams.get('code') ?? '');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);

  const [quizId, setQuizId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // Answers: map questionId → { optionIndexes?, answerText? }
  const [answers, setAnswers] = useState<Record<number, { selected: number[]; text: string }>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [resultQuiz, setResultQuiz] = useState<Quiz | null>(null);

  // Auto-start if code is in URL
  useEffect(() => {
    if (code && phase === 'enter-code') setPhase('enter-name');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || phase !== 'taking') return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setInterval(() => setTimeLeft((t) => (t !== null ? t - 1 : null)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  const handleStart = async () => {
    if (!code.trim()) { toast.error(t('student.enterCodeError')); return; }
    if (!studentName.trim()) { toast.error(t('student.nameRequired')); return; }
    setLoading(true);
    try {
      const { quizId: qid, studentId: sid } = await quizService.startQuiz(studentName, code.trim());
      const quizData = await quizService.getPublicQuiz(qid);
      setQuizId(qid);
      setStudentId(sid);
      setQuiz(quizData);
      if (quizData.durationSecs > 0) setTimeLeft(quizData.durationSecs);
      setPhase('taking');
    } catch {
      toast.error(t('student.startError'));
    } finally {
      setLoading(false);
    }
  };

  const getAnswer = (qId: number) => answers[qId] ?? { selected: [], text: '' };

  const toggleOption = (qId: number, optIdx: number, typeId: number) => {
    setAnswers((prev) => {
      const cur = prev[qId] ?? { selected: [], text: '' };
      let selected: number[];
      if (typeId === 1) {
        selected = [optIdx];
      } else {
        selected = cur.selected.includes(optIdx)
          ? cur.selected.filter((i) => i !== optIdx)
          : [...cur.selected, optIdx];
      }
      return { ...prev, [qId]: { ...cur, selected } };
    });
  };

  const setTextAnswer = (qId: number, text: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: { ...(prev[qId] ?? { selected: [] }), text } }));
  };

  const buildSubmitPayload = (): Partial<Quiz> => {
    if (!quiz) return {};
    return {
      id: quiz.id,
      allowReview: quiz.allowReview,
      questions: quiz.questions.map((q) => {
        const ans = getAnswer(q.id!);
        if (q.questionTypeId === 4) {
          return { ...q, answerText: ans.text, options: [] };
        }
        return {
          ...q,
          options: q.options.map((o, i) => ({
            ...o,
            selected: ans.selected.includes(i) ? 1 : 0,
          })),
        };
      }),
    };
  };

  const handleSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!quiz || quizId === null || studentId === null) return;
    setLoading(true);
    try {
      const payload = buildSubmitPayload();
      const reviewData = await quizService.submitResults(quizId, studentId, payload);
      setResultQuiz(reviewData);
      setPhase('result');
    } catch {
      toast.error(t('student.submitError'));
    } finally {
      setLoading(false);
    }
  };

  const canGoNext = () => {
    if (!quiz) return false;
    const q = quiz.questions[currentIdx];
    if (!quiz.requiredAll) return true;
    const ans = getAnswer(q.id!);
    return q.questionTypeId === 4 ? ans.text.trim().length > 0 : ans.selected.length > 0;
  };

  if (loading) return <LoadingSpinner fullScreen />;

  // ── Phase: enter code ───────────────────────────────────────────────
  if (phase === 'enter-code') {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5 text-center">
                <i className="bi bi-key display-4 text-primary mb-3 d-block" />
                <h4 className="fw-bold mb-4">{t('student.enterToken')}</h4>
                <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) setPhase('enter-name'); }}>
                  <input
                    type="text"
                    className="form-control form-control-lg text-center mb-3"
                    placeholder={t('student.tokenPlaceholder')}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={8}
                  />
                  <button type="submit" className="btn btn-primary btn-lg w-100" disabled={!code.trim()}>
                    {t('student.go')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: enter name ───────────────────────────────────────────────
  if (phase === 'enter-name') {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <code className="fs-5 bg-primary bg-opacity-10 text-primary px-3 py-1 rounded">{code}</code>
                </div>
                <h5 className="fw-bold mb-3 text-center">{t('student.yourName')}</h5>
                <input
                  type="text"
                  className="form-control form-control-lg mb-3"
                  placeholder={t('student.namePlaceholder')}
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                  autoFocus
                />
                <button
                  className="btn btn-primary btn-lg w-100"
                  onClick={handleStart}
                  disabled={!studentName.trim()}
                >
                  {t('student.start')}
                </button>
                <button
                  className="btn btn-link w-100 mt-2 text-muted"
                  onClick={() => setPhase('enter-code')}
                >
                  {t('student.changeCode')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: result ───────────────────────────────────────────────────
  if (phase === 'result') {
    const total = quiz?.questions.reduce((s, q) => s + q.score, 0) ?? 0;
    let scored = 0;
    if (resultQuiz) {
      resultQuiz.questions.forEach((rq) => {
        const origQ = quiz?.questions.find((q) => q.id === rq.id);
        if (!origQ) return;
        if (origQ.questionTypeId === 4) return; // text graded separately
        const correct = rq.options.filter((o) => o.isAnswer === 1).map((o) => o.id);
        const selected = rq.options.filter((o) => o.selected === 1).map((o) => o.id);
        const allCorrect =
          correct.length === selected.length &&
          correct.every((id) => selected.includes(id));
        if (allCorrect) scored += origQ.score;
      });
    }
    const pct = total > 0 ? Math.round((scored / total) * 100) : 0;

    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-7">
            {/* Score card */}
            <div className="card border-0 shadow-sm mb-4 text-center">
              <div className="card-body p-5">
                <div className={`display-2 fw-bold mb-2 ${pct >= 60 ? 'text-success' : 'text-danger'}`}>
                  {pct}%
                </div>
                <p className="fs-5 text-muted">{scored} / {total} {t('student.points')}</p>
                <div className="progress mb-4" style={{ height: 10 }}>
                  <div
                    className={`progress-bar ${pct >= 60 ? 'bg-success' : 'bg-danger'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                  {t('student.goHome')}
                </button>
              </div>
            </div>

            {/* Review answers if allowed */}
            {resultQuiz && quiz?.allowReview && (
              <div>
                <h5 className="fw-semibold mb-3">{t('student.reviewAnswers')}</h5>
                {resultQuiz.questions.map((rq, idx) => {
                  const origQ = quiz.questions.find((q) => q.id === rq.id) ?? rq;
                  const studentAns = answers[origQ.id!];
                  const isTextType = origQ.questionTypeId === 4;

                  return (
                    <div key={rq.id} className="card border-0 shadow-sm mb-3">
                      <div className="card-body p-4">
                        <div className="fw-semibold mb-3">
                          {idx + 1}. {rq.name}
                        </div>
                        {isTextType ? (
                          <div>
                            <div className="border rounded p-2 bg-body-tertiary small mb-2">
                              {studentAns?.text || <em className="text-muted">{t('student.noAnswer')}</em>}
                            </div>
                            {rq.options[0]?.rightAnswer && (
                              <div className="text-success small">
                                <i className="bi bi-check-circle me-1" />
                                {t('student.expected')}: {rq.options[0].rightAnswer}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-2">
                            {rq.options.map((opt: Option) => {
                              const wasSelected = opt.selected === 1;
                              const isCorrect = opt.isAnswer === 1;
                              let cls = 'border rounded px-3 py-2 small ';
                              if (isCorrect) cls += 'border-success bg-success bg-opacity-10 text-success';
                              else if (wasSelected && !isCorrect) cls += 'border-danger bg-danger bg-opacity-10 text-danger';
                              else cls += 'text-body-secondary';
                              return (
                                <div key={opt.id} className={cls}>
                                  {wasSelected && <i className={`bi bi-${isCorrect ? 'check' : 'x'}-circle me-2`} />}
                                  {!wasSelected && isCorrect && <i className="bi bi-check-circle me-2 text-success" />}
                                  {opt.name}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Phase: taking ───────────────────────────────────────────────────
  if (!quiz) return <LoadingSpinner fullScreen />;
  const q: Question = quiz.questions[currentIdx];
  const ans = getAnswer(q.id!);
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === quiz.questions.length - 1;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Header: progress + timer */}
          <div className="d-flex justify-content-between align-items-center mb-3 small text-muted">
            <span>
              {quiz.name} — {t('student.question')} {currentIdx + 1} / {quiz.questions.length}
            </span>
            {timeLeft !== null && quiz.showClock && (
              <span className={`fw-bold ${timeLeft < 60 ? 'text-danger' : ''}`}>
                <i className="bi bi-clock me-1" />{formatTime(timeLeft)}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="progress mb-4" style={{ height: 6 }}>
            <div
              className="progress-bar"
              style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>

          {/* Pager (if enabled) */}
          {quiz.showPager && (
            <div className="d-flex flex-wrap gap-1 mb-3">
              {quiz.questions.map((pq, i) => {
                const a = getAnswer(pq.id!);
                const answered = pq.questionTypeId === 4 ? a.text.trim().length > 0 : a.selected.length > 0;
                return (
                  <button
                    key={i}
                    className={`btn btn-sm ${i === currentIdx ? 'btn-primary' : answered ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                    style={{ width: 34, padding: 0 }}
                    onClick={() => setCurrentIdx(i)}
                    disabled={!quiz.allowBack && i < currentIdx}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          )}

          {/* Question card */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between mb-3">
                <h5 className="fw-semibold mb-0">{q.name}</h5>
                <span className="badge bg-primary bg-opacity-10 text-primary">{q.score} pt</span>
              </div>

              {/* Single / Multiple choice */}
              {(q.questionTypeId === 1 || q.questionTypeId === 2) && (
                <div className="d-flex flex-column gap-2">
                  {q.options.map((opt, oIdx) => {
                    const sel = ans.selected.includes(oIdx);
                    return (
                      <button
                        key={oIdx}
                        className={`btn text-start ${sel ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => toggleOption(q.id!, oIdx, q.questionTypeId)}
                      >
                        <span className="me-2">
                          {q.questionTypeId === 1
                            ? <i className={`bi bi-${sel ? 'record-circle' : 'circle'}`} />
                            : <i className={`bi bi-${sel ? 'check-square' : 'square'}`} />
                          }
                        </span>
                        {opt.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Text / Essay */}
              {q.questionTypeId === 4 && (
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder={t('student.textAnswerPlaceholder')}
                  value={ans.text}
                  onChange={(e) => setTextAnswer(q.id!, e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-secondary"
              disabled={isFirst || !quiz.allowBack}
              onClick={() => setCurrentIdx((i) => i - 1)}
            >
              <i className="bi bi-arrow-left me-1" />{t('student.prev')}
            </button>
            {isLast ? (
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={quiz.requiredAll && !canGoNext()}
              >
                <i className="bi bi-check-lg me-1" />{t('student.submit')}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setCurrentIdx((i) => i + 1)}
                disabled={quiz.autoMove ? false : (quiz.requiredAll && !canGoNext())}
              >
                {t('student.next')}<i className="bi bi-arrow-right ms-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
