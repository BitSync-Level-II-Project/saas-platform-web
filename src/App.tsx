import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import WarehouseTable from './components/WarehouseTable';
import type { Warehouse } from './types';

export default function App() {
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

  return (
    <div className="app-layout">
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div className="main-wrapper">
        <Topbar />

        <main className="page-container">
          {/* Page Heading */}
          <header className="page-header">
            <h1 className="page-title">Warehouses</h1>
            <p className="page-subtitle">Manage warehouses and their locations.</p>
          </header>

          {/* Warehouse Data Table */}
          <WarehouseTable warehouses={warehouses} />
        </main>
      </div>
    </div>
  );
}