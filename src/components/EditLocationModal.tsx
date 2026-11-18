import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Location } from '../types';

interface EditLocationModalProps {
  isOpen: boolean;
  location: Location;
  warehouseName: string;
  onClose: () => void;
  onUpdateLocation: (
    id: string,
    data: {
      name: string;
      description?: string | null;
      status: 'Active' | 'Inactive';
    },
  ) => Promise<void>;
  onDeleteLocation?: (location: Location) => Promise<void> | void;
}

export default function EditLocationModal({
  isOpen,
  location,
  warehouseName,
  onClose,
  onUpdateLocation,
  onDeleteLocation,
}: EditLocationModalProps) {
  const [name, setName] = useState(location.name);
  const [description, setDescription] = useState(location.description || '');
  const [status, setStatus] = useState<'Active' | 'Inactive'>(location.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keyboard accessibility: Escape key closes modal (when not submitting)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter a location name.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdateLocation(location.id, {
        name: trimmedName,
        description: description.trim() || null,
        status,
      });

      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to update location. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="warehouse-modal modal-overlay"
      onClick={() => !isSubmitting && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-location-title"
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 id="edit-location-title" className="modal-title">
              Edit location
            </h2>
            <p className="modal-subtitle">{warehouseName}</p>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => !isSubmitting && onClose()}
            type="button"
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Inline Error Banner */}
        {errorMessage && (
          <div role="alert" className="modal-error-banner">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Location Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-location-name">
              Location name
            </label>
            <input
              id="edit-location-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Description (Optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-location-description">
              Description (optional)
            </label>
            <input
              id="edit-location-description"
              type="text"
              className="form-input"
              placeholder="Ground floor, east wing"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Status Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-location-status">
              Location status
            </label>
            <select
              id="edit-location-status"
              className="form-select"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'Active' | 'Inactive')
              }
              disabled={isSubmitting}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Modal Actions */}
          <div
            className="modal-actions"
            style={{ justifyContent: 'space-between' }}
          >
            {onDeleteLocation ? (
              <button
                type="button"
                className="btn-danger-outline"
                disabled={isSubmitting}
                onClick={() => {
                  onClose();
                  void onDeleteLocation(location);
                }}
              >
                Delete
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
