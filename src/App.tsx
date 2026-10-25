import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import WarehouseFilters from './components/WarehouseFilters';
import WarehouseTable from './components/WarehouseTable';
import type { Warehouse } from './types';

export default function App() {
  // 1. Initial warehouses
  const [warehouses] = useState<Warehouse[]>([
    {
      id: '1',
      name: 'Colombo warehouse',
      city: 'Colombo, Sri Lanka',
      locations: 4,
      supervisor: 'Malith Senanayake',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Galle warehouse',
      city: 'Galle, Sri Lanka',
      locations: 3,
      supervisor: 'Tharushi Perera',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Katunayake warehouse',
      city: 'Katunayake, Sri Lanka',
      locations: 5,
      supervisor: 'Ruwan Silva',
      status: 'Active',
    },
  ]);

  // 2. Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // 3. Filtered list based on user search and status dropdown
  const filteredWarehouses = warehouses.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supervisor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenAddModal = () => {
    alert('Add warehouse modal will open here in the next step!');
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="main-wrapper">
        <Topbar />

        <main className="page-container">
          <header className="page-header">
            <h1 className="page-title">Warehouses</h1>
            <p className="page-subtitle">Manage warehouses and their locations.</p>
          </header>

          {/* Search, Filter, and Add Button Bar */}
          <WarehouseFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onAddClick={handleOpenAddModal}
          />

          {/* Dynamic Table */}
          <WarehouseTable warehouses={filteredWarehouses} />
        </main>
      </div>
    </div>
  );
}