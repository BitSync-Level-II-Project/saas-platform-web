export type CaptureMode = 'Manual entry' | 'Automatic sensor & audio';

// Which templates need a fixed phone with sensors. Mock data; the template
// module will provide this later.
export const TEMPLATE_MODES: Record<string, CaptureMode> = {
  'Equipment inspection': 'Manual entry',
  'Storage check': 'Manual entry',
  'Safety walk': 'Manual entry',
  'Temperature monitoring': 'Automatic sensor & audio',
};

export const captureModeOf = (template: string): CaptureMode =>
  TEMPLATE_MODES[template] ?? 'Manual entry';

export interface StationedPhone {
  id: string;
  name: string;
  warehouse: string;
  location: string;
  sensors: string;
  available: boolean;
}

// Aligned with PostgreSQL registered warehouses & locations
export const PHONES: StationedPhone[] = [
  { id: 'p1', name: 'Colombo loading bay phone', warehouse: 'Colombo', location: 'Loading bay', sensors: 'Temperature probe and microphone', available: true },
  { id: 'p2', name: 'Gampaha intake phone', warehouse: 'Gampaha', location: 'Main bay', sensors: 'Motion sensor', available: true },
];
