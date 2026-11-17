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

// Mock data until the M4-05 aggregate APIs exist.
export const warehouseProgress: WarehouseProgress[] = [
  { warehouse: 'Colombo', locations: 4, supervisor: 'Malith Senanayake', completed: 8, total: 12, openAlerts: 2, recordsReceived: 28 },
  { warehouse: 'Kandy', locations: 3, supervisor: 'Dinithi Fernando', completed: 3, total: 8, openAlerts: 0, recordsReceived: 12 },
  { warehouse: 'Galle', locations: 2, supervisor: 'Tharushi Perera', completed: 4, total: 7, openAlerts: 0, recordsReceived: 8 },
];

export const workers: WorkerActivity[] = [
  { id: 'w1', name: 'Kavindu Perera', warehouse: 'Colombo', currentTask: 'Morning equipment check', status: 'Active', lastSync: '2 min ago', doneToday: 3 },
  { id: 'w2', name: 'Nimal Silva', warehouse: 'Colombo', currentTask: 'Loading bay inspection', status: 'Active', lastSync: '5 min ago', doneToday: 2 },
  { id: 'w3', name: 'Sajith Fernando', warehouse: 'Kandy', currentTask: 'Cold room check', status: 'Offline', lastSync: '47 min ago', doneToday: 1 },
  { id: 'w4', name: 'Ruwan Jayasinghe', warehouse: 'Kandy', currentTask: null, status: 'Idle', lastSync: '12 min ago', doneToday: 2 },
  { id: 'w5', name: 'Amali Wijesinghe', warehouse: 'Galle', currentTask: 'Storage aisle check', status: 'Active', lastSync: '1 min ago', doneToday: 4 },
  { id: 'w6', name: 'Chamod Rathnayake', warehouse: 'Galle', currentTask: null, status: 'Idle', lastSync: '20 min ago', doneToday: 3 },
];