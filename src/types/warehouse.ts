export interface Warehouse {
  id: string;
  name: string;
  city: string;
  address?: string;
  locations: number;
  supervisor: string;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  id: string;
  warehouseId: string;
  organizationId?: string;
  name: string;
  description?: string | null;
  assignedWork?: string | null;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  updatedAt?: string;
}
