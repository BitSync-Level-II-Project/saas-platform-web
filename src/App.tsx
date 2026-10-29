import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import WarehouseFilters from './components/WarehouseFilters';
import WarehouseTable from './components/WarehouseTable';
import WarehouseDetail from './components/WarehouseDetail';
import AddWarehouseModal from './components/AddWarehouseModal';
import { warehouseService } from './services/warehouseService';
import type { Warehouse } from './types';

export default function App() {
  // 1. Load warehouses from our persistent warehouseService
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() =>
    warehouseService.getWarehouses()
  );

  // 2. Navigation state: null = list view, or Warehouse = detail/locations view
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  // 3. Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // 4. Modal state for adding a warehouse
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);

  // 5. Function to add a new warehouse and save to storage
  const handleAddWarehouse = (newWarehouseData: {
    name: string;
    city: string;
    address?: string;
    supervisor: string;
  }) => {
    const newEntry: Warehouse = {
      id: Date.now().toString(),
      name: newWarehouseData.name,
      city: newWarehouseData.city,
      locations: 0,
      supervisor:
        newWarehouseData.supervisor === 'Assign later'
          ? 'Unassigned'
          : newWarehouseData.supervisor,
      status: 'Active',
    };

    // Save permanently via warehouseService
    const updatedList = warehouseService.addWarehouse(newEntry);
    setWarehouses(updatedList);
  };

  // 6. Filter list dynamically based on search & status
  const filteredWarehouses = warehouses.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supervisor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="app-layout">
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="main-wrapper">
        <Topbar />

        <main className="page-container">
          {selectedWarehouse ? (
            /* Locations View (M2-02 - Screenshot 2) */
            <WarehouseDetail
              warehouse={selectedWarehouse}
              onBack={() => {
                // Return to main list and refresh warehouses count
                setSelectedWarehouse(null);
                setWarehouses(warehouseService.getWarehouses());
              }}
              onAddLocationClick={() => {
                alert('Add location modal will open here in Step 2!');
              }}
            />
          ) : (
            /* Main Warehouses List (M2-01) */
            <>
              <header className="page-header">
                <h1 className="page-title">Warehouses</h1>
                <p className="page-subtitle">Manage warehouses and their locations.</p>
              </header>

              {/* Filter Bar with Search, Dropdown & Add button */}
              <WarehouseFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                onAddClick={() => setIsWarehouseModalOpen(true)}
              />

              {/* Table */}
              <WarehouseTable
                warehouses={filteredWarehouses}
                onOpenWarehouse={(warehouse) => setSelectedWarehouse(warehouse)}
              />

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
