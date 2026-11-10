import type { Warehouse, Location } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const LOCATIONS_STORAGE_KEY = 'sitetrace_locations';

export interface CreateWarehouseInput {
  name: string;
  city: string;
  address?: string;
  supervisor?: string;
}

export const warehouseService = {
  //Fetch warehouses directly from PostgreSQL via NestJS API
  getWarehouses: async (
    search?: string,
    status?: string,
  ): Promise<Warehouse[]> => {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (status && status !== 'All') {
      params.append('status', status);
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/warehouses${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch warehouses (HTTP ${response.status})`);
    }

    const data = await response.json();
    return data.items as Warehouse[];
  },

  // Register a new warehouse directly to PostgreSQL via POST
  addWarehouse: async (input: CreateWarehouseInput): Promise<Warehouse> => {
    const response = await fetch(`${API_BASE_URL}/warehouses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        city: input.city,
        address: input.address || '',
        supervisor:
          input.supervisor === 'Assign later'
            ? 'Unassigned'
            : input.supervisor || 'Unassigned',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create warehouse');
    }

    return (await response.json()) as Warehouse;
  },

  // Delete a warehouse directly from PostgreSQL via DELETE
  deleteWarehouse: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete warehouse (HTTP ${response.status})`);
    }
  },

  // Update warehouse details or toggle status via PATCH
  updateWarehouse: async (
    id: string,
    data: Partial<Warehouse>,
  ): Promise<Warehouse> => {
    const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Failed to update warehouse (HTTP ${response.status})`);
    }
    return (await response.json()) as Warehouse;
  },

  //  Locations queries (clean, starts empty until Locations backend phase)
  getLocations: (warehouseId: string): Location[] => {
    const saved = localStorage.getItem(LOCATIONS_STORAGE_KEY);
    if (!saved) return [];
    try {
      const allLocations = JSON.parse(saved) as Location[];
      return allLocations.filter((loc) => loc.warehouseId === warehouseId);
    } catch {
      return [];
    }
  },

  addLocation: (newLocation: Location): Location[] => {
    const saved = localStorage.getItem(LOCATIONS_STORAGE_KEY);
    let allLocations: Location[] = [];
    if (saved) {
      try {
        allLocations = JSON.parse(saved) as Location[];
      } catch {
        allLocations = [];
      }
    }
    const updatedAll = [newLocation, ...allLocations];
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(updatedAll));
    return updatedAll.filter(
      (loc) => loc.warehouseId === newLocation.warehouseId,
    );
  },
};
