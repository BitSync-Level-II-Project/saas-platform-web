import type { Location } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '') ||
  import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '') ||
  'http://localhost:3000/api/v1';

export interface CreateLocationInput {
  name: string;
  description?: string;
  status?: 'Active' | 'Inactive';
}

export interface UpdateLocationInput {
  name?: string;
  description?: string | null;
  status?: 'Active' | 'Inactive';
}

export const locationService = {
  // 1. Fetch all locations for a given warehouse from the NestJS API
  getLocations: async (warehouseId: string): Promise<Location[]> => {
    const response = await fetch(
      `${API_BASE_URL}/warehouses/${warehouseId}/locations`,
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to fetch locations (HTTP ${response.status})`,
      );
    }

    const data = (await response.json()) as Location[];
    return data.map((loc) => ({
      ...loc,
      assignedWork: loc.assignedWork || '0 tasks',
      description: loc.description ?? undefined,
    }));
  },

  // 2. Create a new location under a warehouse
  createLocation: async (
    warehouseId: string,
    input: CreateLocationInput,
  ): Promise<Location> => {
    const response = await fetch(
      `${API_BASE_URL}/warehouses/${warehouseId}/locations`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: input.name.trim(),
          description: input.description?.trim() || undefined,
          status: input.status || 'Active',
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to create location (HTTP ${response.status})`,
      );
    }

    const created = (await response.json()) as Location;
    return {
      ...created,
      assignedWork: created.assignedWork || '0 tasks',
      description: created.description ?? undefined,
    };
  },

  // 3. Update an existing location
  updateLocation: async (
    warehouseId: string,
    id: string,
    input: UpdateLocationInput,
  ): Promise<Location> => {
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.description !== undefined) {
      payload.description =
        input.description === null
          ? null
          : input.description.trim() || undefined;
    }
    if (input.status !== undefined) payload.status = input.status;

    const response = await fetch(
      `${API_BASE_URL}/warehouses/${warehouseId}/locations/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to update location (HTTP ${response.status})`,
      );
    }

    const updated = (await response.json()) as Location;
    return {
      ...updated,
      assignedWork: updated.assignedWork || '0 tasks',
      description: updated.description ?? undefined,
    };
  },

  // 4. Delete a location
  deleteLocation: async (
    warehouseId: string,
    id: string,
  ): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/warehouses/${warehouseId}/locations/${id}`,
      {
        method: 'DELETE',
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to delete location (HTTP ${response.status})`,
      );
    }
  },
};
