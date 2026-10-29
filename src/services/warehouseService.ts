import type { Warehouse, Location } from '../types';

const STORAGE_KEY = 'sitetrace_warehouses';
const LOCATIONS_STORAGE_KEY = 'sitetrace_locations';

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

// Initial default locations matching Screenshot 2
const DEFAULT_LOCATIONS: Location[] = [
  {
    id: 'loc-1',
    warehouseId: '1',
    name: 'Loading bay',
    description: 'Ground floor, dock entrance',
    assignedWork: '4 tasks',
    status: 'Active',
  },
  {
    id: 'loc-2',
    warehouseId: '1',
    name: 'Machine room',
    description: 'Main production facility',
    assignedWork: '6 tasks',
    status: 'Active',
  },
  {
    id: 'loc-3',
    warehouseId: '1',
    name: 'Storage aisle A',
    description: 'High-density pallet rack',
    assignedWork: '2 tasks',
    status: 'Active',
  },
];

export const warehouseService = {
  // 1. Get all warehouses
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

  // 2. Add a new warehouse
  addWarehouse: (newWarehouse: Warehouse): Warehouse[] => {
    const current = warehouseService.getWarehouses();
    const updated = [newWarehouse, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // 3. Get locations for a specific warehouse
  getLocations: (warehouseId: string): Location[] => {
    const saved = localStorage.getItem(LOCATIONS_STORAGE_KEY);
    let allLocations: Location[] = DEFAULT_LOCATIONS;
    if (saved) {
      try {
        allLocations = JSON.parse(saved) as Location[];
      } catch {
        allLocations = DEFAULT_LOCATIONS;
      }
    } else {
      localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS));
    }
    return allLocations.filter((loc) => loc.warehouseId === warehouseId);
  },

  // 4. Add a new location and increment warehouse locations count
  addLocation: (newLocation: Location): Location[] => {
    const saved = localStorage.getItem(LOCATIONS_STORAGE_KEY);
    let allLocations: Location[] = DEFAULT_LOCATIONS;
    if (saved) {
      try {
        allLocations = JSON.parse(saved) as Location[];
      } catch {
        allLocations = DEFAULT_LOCATIONS;
      }
    }
    const updatedAll = [newLocation, ...allLocations];
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(updatedAll));

    // Also increment warehouse location count
    const warehouses = warehouseService.getWarehouses();
    const updatedWarehouses = warehouses.map((w) =>
      w.id === newLocation.warehouseId ? { ...w, locations: w.locations + 1 } : w
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWarehouses));

    return updatedAll.filter((loc) => loc.warehouseId === newLocation.warehouseId);
  },

  // Helper to reset back to initial defaults
  resetDefaults: (): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WAREHOUSES));
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS));
  },
};
