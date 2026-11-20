export type SupervisorStatus = 'Active' | 'Pending';

export interface Supervisor {
  id: string;
  name: string;
  email: string;
  warehouse: string;
  status: SupervisorStatus;
  activationSent: boolean;
}

export type NewSupervisor = Pick<Supervisor, 'name' | 'email' | 'warehouse'>;

export const initialSupervisors: Supervisor[] = [
  { id: 's1', name: 'Tharushi Perera', email: 'tharushi@nova.example', warehouse: 'Colombo', status: 'Active', activationSent: true },
  { id: 's2', name: 'Malith Senanayake', email: 'malith@nova.example', warehouse: 'Gampaha', status: 'Active', activationSent: true },
];
