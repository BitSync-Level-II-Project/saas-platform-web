import { useState } from 'react';
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
  ) => void;
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !city.trim()) {
      alert('Please fill in both the warehouse name and city.');
      return;
    }

    onUpdateWarehouse(warehouse.id, {
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      supervisor: supervisor.trim() || 'Unassigned',
      status,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Modal Box */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Edit warehouse</h2>
            <p className="modal-subtitle">
              Update warehouse information or change its active status.
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
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Supervisor Selection */}
          <div className="form-group">
            <label className="form-label">Supervisor</label>
            <select
              className="form-select"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
            >
              <option value="Unassigned">Unassigned</option>
              <option value="Malith Senanayake">Malith Senanayake</option>
              <option value="Tharushi Perera">Tharushi Perera</option>
              <option value="Ruwan Silva">Ruwan Silva</option>
              <option value="Dinesh Wijesinghe">Dinesh Wijesinghe</option>
            </select>
            <span className="form-help">
              Assign an active supervisor responsible for this facility.
            </span>
          </div>

          {/* Status Selection */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'Active' | 'Inactive')
              }
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
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
