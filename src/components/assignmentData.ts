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

// Mock data; stationed devices belong to the sites and devices module.
export const PHONES: StationedPhone[] = [
  { id: 'p1', name: 'Colombo machine room phone', warehouse: 'Colombo', location: 'Machine room', sensors: 'Temperature probe and microphone', available: true },
  { id: 'p2', name: 'Galle storage aisle phone', warehouse: 'Galle', location: 'Storage aisle', sensors: 'Humidity sensor', available: true },
  { id: 'p3', name: 'Kandy loading bay phone', warehouse: 'Kandy', location: 'Loading bay', sensors: 'Motion sensor', available: false },
];