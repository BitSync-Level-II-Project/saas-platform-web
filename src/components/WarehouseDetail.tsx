import { useState } from 'react';
import { warehouseService } from '../services/warehouseService';
import AddLocationModal from './AddLocationModal';
import type { Warehouse, Location } from '../types';

interface WarehouseDetailProps {
  warehouse: Warehouse;
  onBack: () => void;
  onLocationAdded?: () => void;
}

export default function WarehouseDetail({
  warehouse,
  onBack,
  onLocationAdded,
}: WarehouseDetailProps) {
  // 1. Locations list for this warehouse
  const [locations, setLocations] = useState<Location[]>(() =>
    warehouseService.getLocations(warehouse.id)
  );

  // 2. State for Add Location Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 3. Handler to add a new location
  const handleAddLocation = (data: { name: string; description?: string }) => {
    const newLoc: Location = {
      id: Date.now().toString(),
      warehouseId: warehouse.id,
      name: data.name,
      description: data.description,
      assignedWork: '0 tasks',
      status: 'Active',
    };

    // Save permanently via warehouseService
    const updated = warehouseService.addLocation(newLoc);
    setLocations(updated);
    onLocationAdded?.();
  };

  return (
    <div className="warehouse-detail-view">
      {/* Back navigation link */}
      <button className="back-link" onClick={onBack} type="button">
        ← Warehouses
      </button>

      {/* Detail Header */}
      <div className="detail-header">
        <div>
          <h1 className="detail-title">{warehouse.name}</h1>
          <p className="detail-subtitle">
            {warehouse.supervisor} · {warehouse.city}
          </p>
        </div>
        <button
          className="btn-outline"
          type="button"
          onClick={() => alert(`Edit warehouse feature for ${warehouse.name}`)}
        >
          Edit warehouse
        </button>
      </div>

      {/* Tabs */}
      <div className="detail-tabs-bar">
        <div className="detail-tabs">
          <button className="tab-item active" type="button">
            Locations
          </button>
        </div>

        {/* Add Location Primary Button */}
        <button
          className="btn-primary"
          onClick={() => setIsAddModalOpen(true)}
          type="button"
        >
          Add location
        </button>
      </div>

      {/* Locations Table */}
      <div className="table-container">
        <table className="warehouse-table">
          <thead>
            <tr>
              <th className="table-th">Location</th>
              <th className="table-th">Assigned work</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right"></th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">
                  No capture locations added yet. Click &quot;Add location&quot; to register one.
                </td>
              </tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.id} className="table-row">
                  {/* Location Name & optional description */}
                  <td className="table-td">
                    <div className="location-name">{loc.name}</div>
                    {loc.description && (
                      <div className="location-desc">{loc.description}</div>
                    )}
                  </td>

                  {/* Assigned Work */}
                  <td className="table-td text-muted">
                    {loc.assignedWork}
                  </td>

                  {/* Status Badge */}
                  <td className="table-td">
                    <span className="badge-active">
                      {loc.status}
                    </span>
                  </td>

                  {/* Edit Action */}
                  <td className="table-td text-right">
                    <button
                      className="btn-open"
                      type="button"
                      onClick={() => alert(`Edit location: ${loc.name}`)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Record Counter Footer */}
        <div className="table-footer">
          {locations.length} {locations.length === 1 ? 'record' : 'records'}
        </div>
      </div>

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddModalOpen}
        warehouse={warehouse}
        onClose={() => setIsAddModalOpen(false)}
        onAddLocation={handleAddLocation}
      />
    </div>
  );
}
