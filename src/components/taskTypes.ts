export type TaskStatus = 'Assigned' | 'In progress' | 'Complete';
export type AssigneeType = 'Worker' | 'Stationed phone';

export interface Task {
  id: string;
  code: string;
  title: string;
  warehouse: string;
  location: string;
  template: string;
  supervisor: string;
  dueDate: string; // YYYY-MM-DD
  instructions: string;
  status: TaskStatus;
  assigneeType: AssigneeType | null; // who completes the task
  assignee: string | null;           // worker name or stationed phone name
}

export type NewTask = Omit<Task, 'id' | 'code' | 'status' | 'assigneeType' | 'assignee'>;

export const STATUSES: TaskStatus[] = ['Assigned', 'In progress', 'Complete'];
export const WAREHOUSES = ['Colombo', 'Kandy', 'Galle'];
export const LOCATIONS = ['Machine room', 'Loading bay', 'Storage aisle'];
export const TEMPLATES = ['Equipment inspection', 'Storage check', 'Safety walk', 'Temperature monitoring'];
export const SUPERVISORS = ['Malith Senanayake', 'Tharushi Perera'];

const isoFromToday = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
};

export const todayIso = () => isoFromToday(0);

export const formatDue = (iso: string) => {
  if (iso === isoFromToday(0)) return 'Today';
  if (iso === isoFromToday(-1)) return 'Yesterday';
  if (iso === isoFromToday(1)) return 'Tomorrow';
  return iso;
};

export const statusClass = (s: TaskStatus) =>
  `pill status-${s.toLowerCase().replace(' ', '-')}`;


export const initialTasks: Task[] = [
  {
    id: '1', code: 'TSK-1042', title: 'Morning equipment check',
    warehouse: 'Colombo', location: 'Machine room', template: 'Equipment inspection',
    supervisor: 'Malith Senanayake', dueDate: isoFromToday(0),
    instructions: 'Read display and attach a clear photo.', status: 'In progress',
    assigneeType: 'Worker', assignee: 'Kavindu Perera',
  },
  {
    id: '2', code: 'TSK-1041', title: 'Loading bay inspection',
    warehouse: 'Colombo', location: 'Loading bay', template: 'Safety walk',
    supervisor: 'Malith Senanayake', dueDate: isoFromToday(0),
    instructions: 'Check bay doors and floor markings.', status: 'Assigned',
    assigneeType: null, assignee: null,
  },
  {
    id: '3', code: 'TSK-1038', title: 'Storage aisle check',
    warehouse: 'Galle', location: 'Storage aisle', template: 'Storage check',
    supervisor: 'Tharushi Perera', dueDate: isoFromToday(-1),
    instructions: 'Count pallets in aisles A to C.', status: 'Complete',
    assigneeType: 'Worker', assignee: 'Amali Wijesinghe',
  },
];