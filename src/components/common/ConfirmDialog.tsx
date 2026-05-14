import { useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';

interface ConfirmDialogProps {
  id: string;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
}

export function ConfirmDialog({
  id,
  title,
  message,
  onConfirm,
  confirmLabel = 'Confirm',
  variant = 'danger',
}: ConfirmDialogProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (modalRef.current) {
        const modal = Modal.getInstance(modalRef.current);
        modal?.dispose();
      }
    };
  }, []);

  const handleConfirm = () => {
    onConfirm();
    if (modalRef.current) {
      const modal = Modal.getInstance(modalRef.current);
      modal?.hide();
    }
  };

  return (
    <div className="modal fade" id={id} ref={modalRef} tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" />
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" className={`btn btn-${variant}`} onClick={handleConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
