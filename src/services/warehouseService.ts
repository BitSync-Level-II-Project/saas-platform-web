import type { Warehouse } from '../types';

const STORAGE_KEY = 'sitetrace_warehouses';

// Initial default warehouses matching the design
const DEFAULT_WAREHOUSES: Warehouse[] = [
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
];

export const warehouseService = {
  // 1. Get all warehouses from storage (or use defaults if first time)
  getWarehouses: (): Warehouse[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WAREHOUSES));
      return DEFAULT_WAREHOUSES;
    }
    try {
      return JSON.parse(saved) as Warehouse[];
    } catch {
      return DEFAULT_WAREHOUSES;
    }
  },

  // 2. Add a new warehouse and persist to storage
  addWarehouse: (newWarehouse: Warehouse): Warehouse[] => {
    const current = warehouseService.getWarehouses();
    const updated = [newWarehouse, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // 3. Helper to reset data back to default (useful for testing)
  resetDefaults: (): Warehouse[] => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WAREHOUSES));
    return DEFAULT_WAREHOUSES;
  },
};
