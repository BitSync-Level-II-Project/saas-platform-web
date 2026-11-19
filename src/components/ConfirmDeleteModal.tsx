import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  itemType: 'warehouse' | 'location';
  description?: string;
  isDeleting?: boolean;
  errorMessage?: string | null;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  itemName,
  itemType,
  description,
  isDeleting = false,
  errorMessage = null,
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  // Keyboard accessibility: Escape key closes modal (only when not deleting)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen) return null;

  const defaultDescription =
    itemType === 'warehouse'
      ? 'Deleting this warehouse will permanently remove it along with all of its associated locations. This action cannot be undone.'
      : 'Deleting this location will permanently remove it from this warehouse. This action cannot be undone.';

  return (
    <div
      className="warehouse-modal modal-overlay"
      onClick={() => {
        if (!isDeleting) onClose();
      }}
      role="presentation"
    >
      <div
        className="modal-card confirm-delete-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 id="confirm-delete-title" className="modal-title">
              {title}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error banner if delete fails */}
        {errorMessage && (
          <div className="modal-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        {/* Modal Body */}
        <div className="confirm-delete-body">
          <p className="confirm-delete-message">
            Are you sure you want to delete{' '}
            <strong className="confirm-delete-item-name">"{itemName}"</strong>?
          </p>

          <div className="confirm-delete-warning-box">
            <AlertTriangle
              size={16}
              style={{ flexShrink: 0, marginTop: '2px', color: '#b42318' }}
            />
            <span>{description || defaultDescription}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions" style={{ marginTop: '24px' }}>
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger-confirm"
            onClick={() => void onConfirm()}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
