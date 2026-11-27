import type { Warehouse, Location } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '') ||
  import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '') ||
  'http://localhost:3000/api/v1';
const LOCATIONS_STORAGE_KEY = 'sitetrace_locations';
const WAREHOUSES_STORAGE_KEY = 'sitetrace_warehouses';

const INITIAL_FALLBACK_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-colombo',
    name: 'Colombo Central Depot',
    city: 'Colombo',
    address: '124 Baseline Road, Colombo',
    locations: 4,
    supervisor: 'Malith Senanayake',
    status: 'Active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wh-kandy',
    name: 'Kandy Logistics Hub',
    city: 'Kandy',
    address: '88 Peradeniya Rd, Kandy',
    locations: 3,
    supervisor: 'Dinithi Fernando',
    status: 'Active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wh-galle',
    name: 'Galle Coastal Terminal',
    city: 'Galle',
    address: '12 Matara Rd, Galle',
    locations: 2,
    supervisor: 'Tharushi Perera',
    status: 'Active',
    createdAt: new Date().toISOString(),
  },
];

export interface PaginatedWarehousesResponse {
  items: Warehouse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateWarehouseInput {
  name: string;
  city: string;
  address?: string;
  supervisor?: string;
}

export const warehouseService = {
  getFallbackWarehouses: (
    search?: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ): PaginatedWarehousesResponse => {
    let list: Warehouse[] = [];
    const saved = localStorage.getItem(WAREHOUSES_STORAGE_KEY);
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch {
        list = INITIAL_FALLBACK_WAREHOUSES;
      }
    } else {
      list = INITIAL_FALLBACK_WAREHOUSES;
      localStorage.setItem(WAREHOUSES_STORAGE_KEY, JSON.stringify(list));
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.city.toLowerCase().includes(q) ||
          w.supervisor.toLowerCase().includes(q)
      );
    }

    if (status && status !== 'All') {
      list = list.filter((w) => w.status === status);
    }

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit).map((w) => ({
      ...w,
      locations: warehouseService.getLocations(w.id).length || w.locations || 0,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  },

  //Fetch warehouses directly from PostgreSQL via NestJS API
  getWarehouses: async (
    search?: string,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedWarehousesResponse> => {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (status && status !== 'All') {
      params.append('status', status);
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = `${API_BASE_URL}/warehouses${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return {
          ...(data as PaginatedWarehousesResponse),
          items: (data.items as Warehouse[]).map((w) => ({
            ...w,
            locations: warehouseService.getLocations(w.id).length,
          })),
        };
      }
    } catch {
      // Fallback if backend API is offline
    }

    return warehouseService.getFallbackWarehouses(search, status, page, limit);
  },

  // Register a new warehouse directly to PostgreSQL via POST
  addWarehouse: async (input: CreateWarehouseInput): Promise<Warehouse> => {
    try {
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

      if (response.ok) {
        return (await response.json()) as Warehouse;
      }
    } catch {
      // Fallback
    }

    const saved = localStorage.getItem(WAREHOUSES_STORAGE_KEY);
    const list: Warehouse[] = saved ? JSON.parse(saved) : INITIAL_FALLBACK_WAREHOUSES;
    const newWh: Warehouse = {
      id: `wh-${Date.now()}`,
      name: input.name,
      city: input.city,
      address: input.address || '',
      supervisor:
        input.supervisor === 'Assign later'
          ? 'Unassigned'
          : input.supervisor || 'Unassigned',
      locations: 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    const updated = [newWh, ...list];
    localStorage.setItem(WAREHOUSES_STORAGE_KEY, JSON.stringify(updated));
    return newWh;
  },

  // Delete a warehouse directly from PostgreSQL via DELETE
  deleteWarehouse: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) return;
    } catch {
      // Fallback
    }

    const saved = localStorage.getItem(WAREHOUSES_STORAGE_KEY);
    if (saved) {
      const list: Warehouse[] = JSON.parse(saved);
      const updated = list.filter((w) => w.id !== id);
      localStorage.setItem(WAREHOUSES_STORAGE_KEY, JSON.stringify(updated));
    }
  },

  // Update warehouse details or toggle status via PATCH
  updateWarehouse: async (
    id: string,
    data: Partial<Warehouse>,
  ): Promise<Warehouse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return (await response.json()) as Warehouse;
      }
    } catch {
      // Fallback
    }

    const saved = localStorage.getItem(WAREHOUSES_STORAGE_KEY);
    const list: Warehouse[] = saved ? JSON.parse(saved) : INITIAL_FALLBACK_WAREHOUSES;
    let updatedWh: Warehouse | null = null;
    const updatedList = list.map((w) => {
      if (w.id === id) {
        updatedWh = { ...w, ...data, updatedAt: new Date().toISOString() };
        return updatedWh;
      }
      return w;
    });
    localStorage.setItem(WAREHOUSES_STORAGE_KEY, JSON.stringify(updatedList));
    if (updatedWh) return updatedWh;
    throw new Error('Warehouse not found');
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
