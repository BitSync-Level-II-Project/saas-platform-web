export interface Warehouse {
  id: string;
  name: string;
  city: string;
  locations: number;
  supervisor: string;
  status: 'Active' | 'Inactive';
}