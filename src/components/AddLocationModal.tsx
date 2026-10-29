import { useState } from 'react';
import { X } from 'lucide-react';
import type { Warehouse } from '../types';

interface AddLocationModalProps {
  isOpen: boolean;
  warehouse: Warehouse;
  onClose: () => void;
  onAddLocation: (data: { name: string; description?: string }) => void;
}

export default function AddLocationModal({
  isOpen,
  warehouse,
  onClose,
  onAddLocation,
}: AddLocationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a location name.');
      return;
    }

    onAddLocation({
      name: name.trim(),
      description: description.trim(),
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add location</h2>
            <p className="modal-subtitle">{warehouse.name}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {/* Location Name */}
          <div className="form-group">
            <label className="form-label">Location name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Packing area"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description (Optional) */}
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ground floor, east wing"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
