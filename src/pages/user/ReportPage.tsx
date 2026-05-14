import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { quizService } from '@/services/quiz.service';
import { aiService } from '@/services/ai.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { QuizListItem, QuizToken, QuizResult, Quiz, StudentAnswerRecord } from '@/models';

function TimeDiff({ from, to }: { from?: string; to?: string }) {
  if (!from || !to) return <span className="text-muted">—</span>;
  const diff = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return <span>{m}:{s.toString().padStart(2, '0')}</span>;
}

function AiGradeCell({
  question, answer, expected, score,
}: {
  question: string;
  answer: string;
  expected?: string;
  score: number;
}) {
  const { t } = useTranslation();
  const [result, setResult] = useState<{ score: number; percentage: number; feedback: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const grade = async () => {
    if (!answer.trim()) { toast.error(t('report.emptyAnswer')); return; }
    setLoading(true);
    try {
      const res = await aiService.grade(question, answer, expected, score);
      setResult(res.grade);
    } catch {
      toast.error(t('report.aiGradeError'));
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="small">
        <span className={`badge ${result.percentage >= 60 ? 'bg-success' : 'bg-warning text-dark'}`}>
          {result.score}/{score} ({result.percentage}%)
        </span>
        <div className="text-muted mt-1">{result.feedback}</div>
      </div>
    );
  }

  return (
    <button className="btn btn-sm btn-outline-secondary" onClick={grade} disabled={loading}>
      {loading
        ? <span className="spinner-border spinner-border-sm" />
        : <><i className="bi bi-robot me-1" />{t('report.aiGrade')}</>
      }
    </button>
  );
}

function ResultsTable({
  quizId, tokenId, quiz,
}: {
  quizId: number;
  tokenId: number;
  quiz: Quiz;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ['quiz-results', quizId, tokenId],
    queryFn: () => quizService.getResults(quizId, tokenId),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!results?.length) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="bi bi-people display-4 d-block mb-2" />
        <p>{t('report.noResults')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>{t('report.student')}</th>
              <th>{t('report.started')}</th>
              <th>{t('report.duration')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {results.map((r: QuizResult) => (
              <>
                <tr key={r.id} className="cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id!)}>
                  <td className="fw-semibold">{r.name ?? r.studentName ?? t('report.anonymous')}</td>
                  <td className="text-muted small">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                  </td>
                  <td>
                    <TimeDiff from={r.createdAt} to={r.endAt} />
                  </td>
                  <td>
                    <i className={`bi bi-chevron-${expanded === r.id ? 'up' : 'down'} text-muted`} />
                  </td>
                </tr>

                {expanded === r.id && r.answers && (
                  <tr key={`${r.id}-detail`}>
                    <td colSpan={4} className="p-0">
                      <div className="bg-body-tertiary p-3">
                        <table className="table table-sm mb-0">
                          <thead>
                            <tr>
                              <th>{t('report.question')}</th>
                              <th>{t('report.answer')}</th>
                              <th>{t('report.correct')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quiz.questions.map((q) => {
                              const ans: StudentAnswerRecord | undefined = r.answers?.find(
                                (a) => a.questionId === q.id,
                              );
                              const isText = q.questionTypeId === 4;
                              const correctOpts = q.options.filter((o) => o.isAnswer === 1);
                              const selectedOpts = q.options.filter((_, i) =>
                                r.answers?.some((a) => a.questionId === q.id && a.optionId === q.options[i]?.id && a.selected === 1),
                              );
                              const allCorrect =
                                !isText &&
                                correctOpts.length === selectedOpts.length &&
                                selectedOpts.every((o) => o.isAnswer === 1);

                              return (
                                <tr key={q.id}>
                                  <td className="small">{q.name}</td>
                                  <td className="small">
                                    {isText
                                      ? (ans?.answerText ?? <em className="text-muted">{t('report.noAnswer')}</em>)
                                      : selectedOpts.map((o) => o.name).join(', ') || <em className="text-muted">{t('report.noAnswer')}</em>
                                    }
                                  </td>
                                  <td>
                                    {isText ? (
                                      <AiGradeCell
                                        question={q.name}
                                        answer={ans?.answerText ?? ''}
                                        expected={q.options[0]?.rightAnswer}
                                        score={q.score}
                                      />
                                    ) : (
                                      <i className={`bi bi-${allCorrect ? 'check-circle-fill text-success' : 'x-circle-fill text-danger'}`} />
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const quizIdParam = searchParams.get('id');
  const tokenIdParam = searchParams.get('token');

  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(
    tokenIdParam ? Number(tokenIdParam) : null,
  );
  const [loadedQuiz, setLoadedQuiz] = useState<Quiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ['my-quizzes'],
    queryFn: quizService.getMyQuizzes,
  });

  const selectedQuiz = quizzes?.find((q) => q.id === Number(quizIdParam));

  const loadQuizDetail = async (qId: number) => {
    setLoadingQuiz(true);
    try {
      const q = await quizService.getQuiz(qId);
      setLoadedQuiz(q);
    } catch {
      toast.error(t('report.loadError'));
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Load quiz detail when a quiz + token are selected
  const handleSelectToken = (token: QuizToken, quiz: QuizListItem) => {
    setSelectedTokenId(token.id);
    if (!loadedQuiz || loadedQuiz.id !== quiz.id) loadQuizDetail(quiz.id);
  };

  // ── No quiz selected → show quiz list ───────────────────────────
  if (!quizIdParam) {
    return (
      <div>
        <h2 className="fw-bold mb-4">{t('report.title')}</h2>
        {quizzesLoading && <LoadingSpinner />}
        {!quizzesLoading && !quizzes?.length && (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-bar-chart display-4 d-block mb-3" />
            <p>{t('report.noQuizzes')}</p>
          </div>
        )}
        <div className="row g-3">
          {quizzes?.map((quiz) => (
            <div key={quiz.id} className="col-12">
              <Link to={`/quiz-report?id=${quiz.id}`} className="text-decoration-none">
                <div className="card border-0 shadow-sm card-hover">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">{quiz.name}</div>
                      <div className="text-muted small">
                        {quiz.tokens?.length ?? 0} {t('quiz.keys')}
                        <span className="mx-2">·</span>
                        {quiz.tokens?.reduce((s, k) => s + (k.responses ?? 0), 0) ?? 0} {t('quiz.responses')}
                      </div>
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

  // ── Quiz selected → show token list + results ────────────────────
  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-4">
        <Link to="/quiz-report" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left" />
        </Link>
        <h2 className="fw-bold mb-0">
          {selectedQuiz?.name ?? t('report.results')}
        </h2>
      </div>

      {quizzesLoading && <LoadingSpinner />}

      {selectedQuiz && (
        <div className="row g-4">
          {/* Token selector */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent fw-semibold small text-muted">
                {t('quiz.accessKeys')}
              </div>
              <div className="list-group list-group-flush">
                {!selectedQuiz.tokens?.length ? (
                  <div className="p-3 text-muted small">{t('quiz.noKeys')}</div>
                ) : (
                  selectedQuiz.tokens.map((token: QuizToken) => (
                    <button
                      key={token.id}
                      className={`list-group-item list-group-item-action py-2 ${selectedTokenId === token.id ? 'active' : ''}`}
                      onClick={() => handleSelectToken(token, selectedQuiz)}
                    >
                      <div className="fw-semibold"><code>{token.token}</code></div>
                      <div className="small opacity-75">
                        {token.description || '—'}
                        <span className="ms-2">{token.responses} {t('quiz.responses')}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Results panel */}
          <div className="col-md-9">
            {!selectedTokenId ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body py-5 text-center text-muted">
                  <i className="bi bi-bar-chart display-4 d-block mb-3" />
                  <p>{t('report.selectToken')}</p>
                </div>
              </div>
            ) : loadingQuiz ? (
              <LoadingSpinner />
            ) : loadedQuiz ? (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent">
                  <span className="fw-semibold">
                    {selectedQuiz.tokens?.find((k) => k.id === selectedTokenId)?.description || (
                      <code>{selectedQuiz.tokens?.find((k) => k.id === selectedTokenId)?.token}</code>
                    )}
                  </span>
                </div>
                <div className="card-body p-0">
                  <ResultsTable
                    quizId={selectedQuiz.id}
                    tokenId={selectedTokenId}
                    quiz={loadedQuiz}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
