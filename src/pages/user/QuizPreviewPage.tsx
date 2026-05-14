import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export function QuizPreviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5 text-center">
              <i className="bi bi-key display-4 text-primary mb-3 d-block" />
              <h4 className="fw-bold mb-2">{t('student.enterToken')}</h4>
              <p className="text-muted small mb-4">{t('student.tokenHint')}</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (code.trim()) navigate(`/token?code=${code.trim()}`);
                }}
              >
                <input
                  type="text"
                  className="form-control form-control-lg text-center mb-3"
                  placeholder={t('student.tokenPlaceholder')}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  autoFocus
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
