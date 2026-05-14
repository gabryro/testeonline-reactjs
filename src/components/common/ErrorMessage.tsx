interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message = 'An error occurred', onRetry }: ErrorMessageProps) {
  return (
    <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
      <i className="bi bi-exclamation-circle-fill flex-shrink-0" />
      <span>{message}</span>
      {onRetry && (
        <button className="btn btn-sm btn-outline-danger ms-auto" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
