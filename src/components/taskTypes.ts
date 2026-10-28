export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Assigned' | 'In progress' | 'To review' | 'Recheck' | 'Approved';

export interface Task {
  id: string;
  code: string;
  title: string;
  location: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignee: string | null; // worker id
}

export interface Worker {
  id: string;
  name: string;
}

export const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export const WORKERS: Worker[] = [
  { id: 'w1', name: 'Kavindu' },
  { id: 'w2', name: 'Nimal' },
  { id: 'w3', name: 'Sajith' },
];

export const workerName = (id: string | null) =>
  WORKERS.find((w) => w.id === id)?.name ?? 'Unassigned';

export const initialTasks: Task[] = [
  { id: '1', code: 'TSK-1042', title: 'Morning equipment check', location: 'Machine room', priority: 'High', status: 'Assigned', dueDate: 'Today, 11:00', assignee: 'w1' },
  { id: '2', code: 'TSK-1041', title: 'Loading bay inspection', location: 'Loading bay', priority: 'Medium', status: 'In progress', dueDate: 'Today, 14:00', assignee: 'w2' },
  { id: '3', code: 'TSK-1039', title: 'Meter display evidence', location: 'Machine room', priority: 'Critical', status: 'Recheck', dueDate: 'Today, 15:00', assignee: null },
];