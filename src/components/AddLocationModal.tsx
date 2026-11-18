import { useState } from 'react';
import { X } from 'lucide-react';
import type { Warehouse } from '../types';

interface AddLocationModalProps {
  isOpen: boolean;
  warehouse: Warehouse;
  onClose: () => void;
  onAddLocation: (data: {
    name: string;
    description?: string;
  }) => Promise<void> | void;
}

export default function AddLocationModal({
  isOpen,
  warehouse,
  onClose,
  onAddLocation,
}: AddLocationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    setName('');
    setDescription('');
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Please enter a location name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onAddLocation({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create location.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="warehouse-modal modal-overlay" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add location</h2>
            <p className="modal-subtitle">{warehouse.name}</p>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            type="button"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="modal-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Location Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="location-name">
              Location name
            </label>
            <input
              id="location-name"
              type="text"
              className="form-input"
              placeholder="Packing area"
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
            <label className="form-label" htmlFor="location-description">
              Description (optional)
            </label>
            <input
              id="location-description"
              type="text"
              className="form-input"
              placeholder="Ground floor, east wing"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
