import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AddWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWarehouse: (data: {
    name: string;
    city: string;
    address?: string;
    supervisor: string;
  }) => Promise<void>;
}

export default function AddWarehouseModal({
  isOpen,
  onClose,
  onAddWarehouse,
}: AddWarehouseModalProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [supervisor, setSupervisor] = useState('Assign later');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keyboard accessibility: Escape key closes modal (only when not submitting)
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
      await onAddWarehouse({
        name: trimmedName,
        city: trimmedCity,
        address: address.trim(),
        supervisor,
      });

      // Reset fields and close ONLY on success
      setName('');
      setCity('');
      setAddress('');
      setSupervisor('Assign later');
      setErrorMessage(null);
      onClose();
    } catch (err: unknown) {
      // Preserve entered input values on failure
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to create warehouse. Please try again.';
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
      aria-labelledby="add-warehouse-title"
    >
      {/* Modal Box */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 id="add-warehouse-title" className="modal-title">
              Add warehouse
            </h2>
            <p className="modal-subtitle">
              Register a warehouse, then add its capture locations.
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
            <label className="form-label" htmlFor="warehouse-name">
              Warehouse name
            </label>
            <input
              id="warehouse-name"
              type="text"
              className="form-input"
              placeholder="Kurunegala warehouse"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* City / Area */}
          <div className="form-group">
            <label className="form-label" htmlFor="warehouse-city">
              City / area
            </label>
            <input
              id="warehouse-city"
              type="text"
              className="form-input"
              placeholder="Kurunegala, Sri Lanka"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Address (Optional) */}
          <div className="form-group">
            <label className="form-label" htmlFor="warehouse-address">
              Address (optional)
            </label>
            <input
              id="warehouse-address"
              type="text"
              className="form-input"
              placeholder="Enter warehouse address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Supervisor Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="warehouse-supervisor">
              Supervisor (optional)
            </label>
            <select
              id="warehouse-supervisor"
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
            <span className="form-help">
              Assign an active Supervisor before creating tasks.
            </span>
          </div>

          {/* Modal Action Buttons */}
          <div className="modal-actions">
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
              {isSubmitting ? 'Registering...' : 'Add warehouse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
