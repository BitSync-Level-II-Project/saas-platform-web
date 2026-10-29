export interface Warehouse {
  id: string;
  name: string;
  city: string;
  locations: number;
  supervisor: string;
  status: 'Active' | 'Inactive';
}

export interface Location {
  id: string;
  warehouseId: string;
  name: string;
  description?: string;
  assignedWork: string;
  status: 'Active' | 'Inactive';
}
