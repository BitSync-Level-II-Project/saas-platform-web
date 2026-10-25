import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import WarehouseFilters from './components/WarehouseFilters';
import WarehouseTable from './components/WarehouseTable';
import AddWarehouseModal from './components/AddWarehouseModal';
import { warehouseService } from './services/warehouseService';
import type { Warehouse } from './types';

export default function App() {
  // 1. Load warehouses from our persistent warehouseService
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() =>
    warehouseService.getWarehouses()
  );

  // 2. Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // 3. Modal open/close state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 4. Function to add a new warehouse and save to storage
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

  // 5. Filter list dynamically based on search & status
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
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Topbar />

        <main className="page-container">
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
            onAddClick={() => setIsModalOpen(true)}
          />

          {/* Table */}
          <WarehouseTable warehouses={filteredWarehouses} />

          {/* Add Warehouse Modal Dialog */}
          <AddWarehouseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAddWarehouse={handleAddWarehouse}
          />
        </main>
      </div>
    </div>
  );
}
