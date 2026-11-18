import { useCallback, useEffect, useState } from 'react';
import { warehouseService } from '../services/warehouseService';
import { locationService } from '../services/locationService';
import AddLocationModal from './AddLocationModal';
import EditLocationModal from './EditLocationModal';
import EditWarehouseModal from './EditWarehouseModal';
import type { Warehouse, Location } from '../types';

interface WarehouseDetailProps {
  warehouse: Warehouse;
  onBack: () => void;
  onLocationAdded?: () => void;
  onWarehouseUpdated?: (updated: Warehouse) => void;
  onDeleteWarehouse?: (warehouse: Warehouse) => void;
}

export default function WarehouseDetail({
  warehouse,
  onBack,
  onLocationAdded,
  onWarehouseUpdated,
  onDeleteWarehouse,
}: WarehouseDetailProps) {
  // 1. Locations list & live state
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // 2. Modals state
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [isEditWarehouseModalOpen, setIsEditWarehouseModalOpen] =
    useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  // 3. Trigger reload of locations
  const reloadLocations = useCallback(() => {
    setIsLoading(true);
    setRefreshIndex((prev) => prev + 1);
  }, []);

  // 4. Fetch live locations from NestJS backend API with cancellation safety
  useEffect(() => {
    let isCancelled = false;

    locationService
      .getLocations(warehouse.id)
      .then((data) => {
        if (!isCancelled) {
          setLocations(data);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load locations';
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [warehouse.id, refreshIndex]);

  // 5. Handler to add a new location
  const handleAddLocation = async (data: {
    name: string;
    description?: string;
  }) => {
    await locationService.createLocation(warehouse.id, {
      name: data.name,
      description: data.description,
    });
    reloadLocations();
    onLocationAdded?.();
  };

  // 6. Handler to update warehouse
  const handleUpdateWarehouse = async (
    id: string,
    updatedData: {
      name: string;
      city: string;
      address?: string;
      supervisor: string;
      status: 'Active' | 'Inactive';
    },
  ) => {
    const updated = await warehouseService.updateWarehouse(id, updatedData);
    onWarehouseUpdated?.(updated);
  };

  // 7. Handler to update location
  const handleUpdateLocation = async (
    id: string,
    data: {
      name: string;
      description?: string | null;
      status: 'Active' | 'Inactive';
    },
  ) => {
    await locationService.updateLocation(warehouse.id, id, data);
    reloadLocations();
  };

  // 8. Handler to delete location
  const handleDeleteLocation = async (loc: Location) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${loc.name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await locationService.deleteLocation(warehouse.id, loc.id);
      reloadLocations();
      onLocationAdded?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete location';
      setError(message);
    }
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
          onClick={() => setIsEditWarehouseModalOpen(true)}
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
          onClick={() => setIsAddLocationModalOpen(true)}
          type="button"
        >
          Add location
        </button>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="location-error-banner" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="btn-retry"
            onClick={reloadLocations}
          >
            Retry
          </button>
        </div>
      )}

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
            {isLoading ? (
              <tr>
                <td colSpan={4} className="empty-state">
                  <div className="locations-loading">
                    <span className="spinner" />
                    <span>Loading capture locations...</span>
                  </div>
                </td>
              </tr>
            ) : locations.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-state">
                  No capture locations added yet. Click &quot;Add location&quot;
                  to register one.
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
                    {loc.assignedWork || '0 tasks'}
                  </td>

                  {/* Status Badge */}
                  <td className="table-td">
                    <span
                      className={
                        loc.status === 'Active'
                          ? 'badge-active'
                          : 'badge-inactive'
                      }
                    >
                      {loc.status}
                    </span>
                  </td>

                  {/* Edit Action Button */}
                  <td className="table-td text-right">
                    <button
                      className="btn-open"
                      type="button"
                      onClick={() => setEditingLocation(loc)}
                      title="Edit capture location"
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
          {isLoading
            ? 'Loading records...'
            : `${locations.length} ${locations.length === 1 ? 'record' : 'records'}`}
        </div>
      </div>

      {/* Edit Warehouse Modal (keyed so form resets whenever warehouse updates) */}
      {isEditWarehouseModalOpen && (
        <EditWarehouseModal
          key={`${warehouse.id}-${warehouse.updatedAt || ''}`}
          isOpen={isEditWarehouseModalOpen}
          warehouse={warehouse}
          onClose={() => setIsEditWarehouseModalOpen(false)}
          onUpdateWarehouse={handleUpdateWarehouse}
          onDeleteWarehouse={onDeleteWarehouse}
        />
      )}

      {/* Add Location Modal */}
      <AddLocationModal
        isOpen={isAddLocationModalOpen}
        warehouse={warehouse}
        onClose={() => setIsAddLocationModalOpen(false)}
        onAddLocation={handleAddLocation}
      />

      {/* Edit Location Modal */}
      {editingLocation && (
        <EditLocationModal
          key={`${editingLocation.id}-${editingLocation.updatedAt || ''}`}
          isOpen={Boolean(editingLocation)}
          location={editingLocation}
          warehouseName={warehouse.name}
          onClose={() => setEditingLocation(null)}
          onUpdateLocation={handleUpdateLocation}
          onDeleteLocation={handleDeleteLocation}
        />
      )}
    </div>
  );
}
