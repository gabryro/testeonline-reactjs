import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { quizService } from '@/services/quiz.service';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Quiz, StudentAnswer } from '@/models';

export function StudentPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [studentName, setStudentName] = useState('');
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ score: number; max: number; percentage: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setLoading(true);
      quizService.resolveToken(token)
        .then((res) => {
          if (res.type === 'quiz') setQuiz(res.data as Quiz);
          else toast.error(t('student.notAQuiz'));
        })
        .catch(() => toast.error(t('student.invalidToken')))
        .finally(() => setLoading(false));
    }
  }, [token, t]);

  const setAnswer = (questionId: string, optionIdx: number, questionType: string) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        let selectedOptions = existing.selectedOptions || [];
        if (questionType === 'single') {
          selectedOptions = [String(optionIdx)];
        } else {
          if (selectedOptions.includes(String(optionIdx))) {
            selectedOptions = selectedOptions.filter((o) => o !== String(optionIdx));
          } else {
            selectedOptions = [...selectedOptions, String(optionIdx)];
          }
        }
        return prev.map((a) => a.questionId === questionId ? { ...a, selectedOptions } : a);
      }
      return [...prev, { questionId, selectedOptions: [String(optionIdx)] }];
    });
  };

  const handleSubmit = () => {
    if (!quiz) return;
    let correct = 0;
    const max = quiz.questions.reduce((s, q) => s + (q.points || 1), 0);
    quiz.questions.forEach((q) => {
      const ans = answers.find((a) => a.questionId === q.id);
      if (!ans) return;
      const correctIds = q.options.map((o, i) => o.isCorrect ? String(i) : null).filter(Boolean) as string[];
      const selected = ans.selectedOptions || [];
      const isCorrect =
        correctIds.length === selected.length &&
        correctIds.every((id) => selected.includes(id));
      if (isCorrect) correct += q.points || 1;
    });
    const percentage = Math.round((correct / max) * 100);
    setScore({ score: correct, max, percentage });
    setSubmitted(true);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (!token) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 text-center">
                <i className="bi bi-key display-4 text-primary mb-3 d-block" />
                <h4>{t('student.enterToken')}</h4>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const val = (e.currentTarget.querySelector('input') as HTMLInputElement).value;
                  if (val) navigate(`/token?token=${val}`);
                }}>
                  <input type="text" className="form-control mb-3" placeholder={t('student.tokenPlaceholder')} />
                  <button type="submit" className="btn btn-primary w-100">{t('student.go')}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) return <LoadingSpinner fullScreen />;

  if (submitted && score) {
    return (
      <div className="container py-5 text-center">
        <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: 480 }}>
          <div className="card-body p-5">
            <div className={`display-1 fw-bold mb-3 ${score.percentage >= 60 ? 'text-success' : 'text-danger'}`}>
              {score.percentage}%
            </div>
            <p className="fs-5">{score.score} / {score.max} {t('student.points')}</p>
            <div className="progress mb-4" style={{ height: 12 }}>
              <div
                className={`progress-bar ${score.percentage >= 60 ? 'bg-success' : 'bg-danger'}`}
                style={{ width: `${score.percentage}%` }}
              />
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              {t('student.goHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h3 className="fw-bold mb-2">{quiz.title}</h3>
                <p className="text-muted">{quiz.description}</p>
                <p className="text-muted small">{quiz.questions.length} {t('quiz.questions')}</p>
                <div className="mb-3">
                  <label className="form-label">{t('student.yourName')}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder={t('student.namePlaceholder')}
                  />
                </div>
                <button className="btn btn-primary w-100" onClick={() => setStarted(true)}>
                  {t('student.start')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const q = quiz.questions[currentIdx];
  const currentAnswer = answers.find((a) => a.questionId === q.id);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="mb-3">
            <div className="d-flex justify-content-between small text-muted mb-1">
              <span>{t('student.question')} {currentIdx + 1} / {quiz.questions.length}</span>
              <span>{Math.round(((currentIdx + 1) / quiz.questions.length) * 100)}%</span>
            </div>
            <div className="progress" style={{ height: 6 }}>
              <div
                className="progress-bar"
                style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body p-4">
              <h5 className="fw-semibold mb-4">{q.text}</h5>
              <div className="d-flex flex-column gap-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = currentAnswer?.selectedOptions?.includes(String(oIdx));
                  return (
                    <button
                      key={oIdx}
                      className={`btn text-start ${isSelected ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setAnswer(q.id || String(currentIdx), oIdx, q.type)}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-secondary"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
            >
              {t('student.prev')}
            </button>
            {currentIdx < quiz.questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setCurrentIdx((i) => i + 1)}>
                {t('student.next')}
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleSubmit}>
                {t('student.submit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
