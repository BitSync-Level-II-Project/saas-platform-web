import { useState } from 'react';
import { X } from 'lucide-react';

interface AddWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWarehouse: (data: {
    name: string;
    city: string;
    address?: string;
    supervisor: string;
  }) => void;
}

export default function AddWarehouseModal({
  isOpen,
  onClose,
  onAddWarehouse,
}: AddWarehouseModalProps) {
  // Simple form input states
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [supervisor, setSupervisor] = useState('Assign later');

  // If modal is not open, do not render anything
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim() || !city.trim()) {
      alert('Please fill in both the warehouse name and city.');
      return;
    }

    // Call the parent function to add the new warehouse
    onAddWarehouse({
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      supervisor,
    });

    // Reset fields and close
    setName('');
    setCity('');
    setAddress('');
    setSupervisor('Assign later');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal Box */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add warehouse</h2>
            <p className="modal-subtitle">
              Register a warehouse, then add its capture locations.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Warehouse Name */}
          <div className="form-group">
            <label className="form-label">Warehouse name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Kurunegala warehouse"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* City / Area */}
          <div className="form-group">
            <label className="form-label">City / area</label>
            <input
              type="text"
              className="form-input"
              placeholder="Kurunegala, Sri Lanka"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          {/* Address (Optional) */}
          <div className="form-group">
            <label className="form-label">Address (optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter warehouse address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Supervisor Selection */}
          <div className="form-group">
            <label className="form-label">Supervisor (optional)</label>
            <select
              className="form-select"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
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
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add warehouse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}