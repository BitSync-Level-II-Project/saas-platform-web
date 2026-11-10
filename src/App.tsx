import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import WarehouseFilters from './components/WarehouseFilters';
import WarehouseTable from './components/WarehouseTable';
import WarehouseDetail from './components/WarehouseDetail';
import AddWarehouseModal from './components/AddWarehouseModal';
import { warehouseService } from './services/warehouseService';
import type { Warehouse } from './types';

export default function App() {
  // 1. Live warehouses state from PostgreSQL backend
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 2. Navigation state: null = list view, or Warehouse = detail/locations view
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null,
  );

  // 3. Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // 4. Modal state for adding a warehouse
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);

  // 5. Fetch warehouses from NestJS backend API on mount or filter changes
  useEffect(() => {
    let isCancelled = false;

    warehouseService
      .getWarehouses(searchTerm, statusFilter)
      .then((data) => {
        if (!isCancelled) {
          setWarehouses(data);
          setErrorMessage(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Failed to connect to backend API';
          setErrorMessage(msg);
          setWarehouses([]);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [searchTerm, statusFilter, refreshTrigger]);

  // Helper to trigger a live re-fetch from PostgreSQL
  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // 6. Function to register a new warehouse directly to PostgreSQL
  const handleAddWarehouse = async (newWarehouseData: {
    name: string;
    city: string;
    address?: string;
    supervisor: string;
  }) => {
    try {
      await warehouseService.addWarehouse(newWarehouseData);
      triggerRefresh();
      setIsWarehouseModalOpen(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to create warehouse';
      alert(msg);
    }
  };

  return (
    <div className="app-layout">
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="main-wrapper">
        <Topbar />

        <main className="page-container">
          {selectedWarehouse ? (
            /* Locations View (M2-02) */
            <WarehouseDetail
              warehouse={selectedWarehouse}
              onBack={() => {
                setSelectedWarehouse(null);
                triggerRefresh();
              }}
              onLocationAdded={() => {
                triggerRefresh();
              }}
            />
          ) : (
            /* Main Warehouses List (M2-01) */
            <>
              <header className="page-header">
                <h1 className="page-title">Warehouses</h1>
                <p className="page-subtitle">
                  Manage warehouses and their locations.
                </p>
              </header>

              {/* Filter Bar with Search, Dropdown & Add button */}
              <WarehouseFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                onAddClick={() => setIsWarehouseModalOpen(true)}
              />

              {/* Error banner if backend server is not running */}
              {errorMessage && (
                <div
                  style={{
                    backgroundColor: '#FEE2E2',
                    color: '#B91C1C',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontSize: '14px',
                  }}
                >
                  ⚠️ <strong>Backend Offline:</strong> {errorMessage}. Make sure
                  the backend server is running on port 3000 (
                  <code>npm run start:dev</code>).
                </div>
              )}

              {/* Loading State or Table */}
              {isLoading && warehouses.length === 0 ? (
                <div
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#6B7280',
                  }}
                >
                  Loading warehouses from database...
                </div>
              ) : (
                <WarehouseTable
                  warehouses={warehouses}
                  onOpenWarehouse={(warehouse) =>
                    setSelectedWarehouse(warehouse)
                  }
                />
              )}

              {/* Add Warehouse Modal Dialog */}
              <AddWarehouseModal
                isOpen={isWarehouseModalOpen}
                onClose={() => setIsWarehouseModalOpen(false)}
                onAddWarehouse={handleAddWarehouse}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
