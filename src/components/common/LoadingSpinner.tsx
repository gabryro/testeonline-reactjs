interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ fullScreen = false, size = 'md' }: LoadingSpinnerProps) {
  const sizeMap = { sm: '1rem', md: '2rem', lg: '3rem' };

  const spinner = (
    <div className="d-flex justify-content-center align-items-center">
      <div
        className="spinner-border text-primary"
        style={{ width: sizeMap[size], height: sizeMap[size] }}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}
