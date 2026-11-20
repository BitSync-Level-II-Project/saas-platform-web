export interface WarehouseProgress {
  warehouse: string;
  locations: number;
  supervisor: string;
  completed: number;
  total: number;
  openAlerts: number;
  recordsReceived: number;
}

export type Activity = 'Active' | 'Idle' | 'Offline';

export interface WorkerActivity {
  id: string;
  name: string;
  warehouse: string;
  currentTask: string | null;
  status: Activity;
  lastSync: string;
  doneToday: number;
}

// Aligned with PostgreSQL registered warehouses (Colombo & Gampaha)
export const warehouseProgress: WarehouseProgress[] = [
  { warehouse: 'Colombo', locations: 1, supervisor: 'Tharushi Perera', completed: 2, total: 3, openAlerts: 0, recordsReceived: 14 },
  { warehouse: 'Gampaha', locations: 0, supervisor: 'Malith Senanayake', completed: 1, total: 2, openAlerts: 0, recordsReceived: 6 },
];

export const workers: WorkerActivity[] = [
  { id: 'w1', name: 'Kavindu Perera', warehouse: 'Colombo', currentTask: 'Morning equipment check', status: 'Active', lastSync: '2 min ago', doneToday: 3 },
  { id: 'w2', name: 'Nimal Silva', warehouse: 'Colombo', currentTask: 'Loading bay inspection', status: 'Active', lastSync: '5 min ago', doneToday: 2 },
  { id: 'w3', name: 'Sajith Fernando', warehouse: 'Gampaha', currentTask: 'Main bay intake check', status: 'Active', lastSync: '12 min ago', doneToday: 1 },
  { id: 'w4', name: 'Ruwan Jayasinghe', warehouse: 'Gampaha', currentTask: null, status: 'Idle', lastSync: '30 min ago', doneToday: 2 },
];
