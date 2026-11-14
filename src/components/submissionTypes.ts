export type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected';
export type SubmissionSource = 'Worker' | 'Stationed phone';

export interface Submission {
  id: string;
  taskCode: string;
  taskTitle: string;
  submittedBy: string;
  warehouse: string;
  source: SubmissionSource;
  submittedAt: string;
  status: SubmissionStatus;
  exception: boolean;
  data: { label: string; value: string }[];
  reviewNote: string;
}

// Mock data until the Submission Review APIs exist. Task codes match initialTasks.
export const initialSubmissions: Submission[] = [
  {
    id: 'SUB-201', taskCode: 'TSK-1042', taskTitle: 'Morning equipment check',
    submittedBy: 'Kavindu Perera', warehouse: 'Colombo', source: 'Worker',
    submittedAt: 'Today, 10:42', status: 'Pending', exception: true,
    data: [
      { label: 'Temperature', value: '86 °C (limit 80 °C)' },
      { label: 'Pressure', value: '3.2 bar' },
      { label: 'Photo', value: 'display_reading.jpg' },
    ],
    reviewNote: '',
  },
  {
    id: 'SUB-202', taskCode: 'TSK-1041', taskTitle: 'Loading bay inspection',
    submittedBy: 'Nimal Silva', warehouse: 'Colombo', source: 'Worker',
    submittedAt: 'Today, 13:55', status: 'Pending', exception: false,
    data: [
      { label: 'Bay doors secured', value: 'Yes' },
      { label: 'Floor markings', value: 'Clear' },
      { label: 'Photo', value: 'bay_entrance.jpg' },
    ],
    reviewNote: '',
  },
  {
    id: 'SUB-203', taskCode: 'TSK-1038', taskTitle: 'Storage aisle check',
    submittedBy: 'Amali Wijesinghe', warehouse: 'Galle', source: 'Worker',
    submittedAt: 'Yesterday, 16:20', status: 'Approved', exception: false,
    data: [
      { label: 'Pallets counted', value: '124' },
      { label: 'Aisles checked', value: 'A to C' },
    ],
    reviewNote: 'Count matches the stock sheet.',
  },
];