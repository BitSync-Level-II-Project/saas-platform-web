import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Warehouse } from '../types';

interface EditWarehouseModalProps {
  isOpen: boolean;
  warehouse: Warehouse;
  onClose: () => void;
  onUpdateWarehouse: (
    id: string,
    updatedData: {
      name: string;
      city: string;
      address?: string;
      supervisor: string;
      status: 'Active' | 'Inactive';
    },
  ) => Promise<void>;
  onDeleteWarehouse?: (warehouse: Warehouse) => void;
}

export default function EditWarehouseModal({
  isOpen,
  warehouse,
  onClose,
  onUpdateWarehouse,
  onDeleteWarehouse,
}: EditWarehouseModalProps) {
  const [name, setName] = useState(warehouse.name);
  const [city, setCity] = useState(warehouse.city);
  const [address, setAddress] = useState(warehouse.address || '');
  const [supervisor, setSupervisor] = useState(warehouse.supervisor);
  const [status, setStatus] = useState<'Active' | 'Inactive'>(warehouse.status);
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
    const trimmedCity = city.trim();

    if (!trimmedName || !trimmedCity) {
      setErrorMessage('Please fill in both the warehouse name and city.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdateWarehouse(warehouse.id, {
        name: trimmedName,
        city: trimmedCity,
        address: address.trim(),
        supervisor: supervisor.trim() || 'Unassigned',
        status,
      });

      onClose();
    } catch (err: unknown) {
      // Preserve entered edits on failure
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to update warehouse. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => !isSubmitting && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-warehouse-title"
    >
      {/* Modal Box */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 id="edit-warehouse-title" className="modal-title">
              Edit warehouse
            </h2>
            <p className="modal-subtitle">
              Update warehouse information or change its active status.
            </p>
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
          {/* Warehouse Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-warehouse-name">
              Warehouse name
            </label>
            <input
              id="edit-warehouse-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* City / Area */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-warehouse-city">
              City / area
            </label>
            <input
              id="edit-warehouse-city"
              type="text"
              className="form-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Address (Optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-warehouse-address">
              Address (optional)
            </label>
            <input
              id="edit-warehouse-address"
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Supervisor Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-warehouse-supervisor">
              Supervisor (optional)
            </label>
            <select
              id="edit-warehouse-supervisor"
              className="form-select"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="Assign later">Assign later</option>
              <option value="Malith Senanayake">Malith Senanayake</option>
              <option value="Tharushi Perera">Tharushi Perera</option>
              <option value="Ruwan Silva">Ruwan Silva</option>
            </select>
          </div>

          {/* Status Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="edit-warehouse-status">
              Warehouse status
            </label>
            <select
              id="edit-warehouse-status"
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

          {/* Modal Action Buttons */}
          <div
            className="modal-actions"
            style={{ justifyContent: 'space-between' }}
          >
            {onDeleteWarehouse ? (
              <button
                type="button"
                className="btn-danger-outline"
                disabled={isSubmitting}
                onClick={() => {
                  onClose();
                  onDeleteWarehouse(warehouse);
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
