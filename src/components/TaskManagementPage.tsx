import { useState } from 'react';
import { TaskTable } from './TaskTable';
import { STATUSES } from './taskTypes';
import type { Task, TaskStatus } from './taskTypes';

interface Props {
  tasks: Task[];
  onCreate: () => void;
  onOpen: (id: string) => void;
}

export function TaskManagementPage({ tasks, onCreate, onOpen }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatus | 'All'>('All');

  const q = search.toLowerCase();
  const visible = tasks.filter(
    (t) =>
      (t.title.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.warehouse.toLowerCase().includes(q)) &&
      (status === 'All' || t.status === status)
  );

  return (
    <div className="page">
      <h1 className="page-title">Tasks</h1>
      <p className="page-sub">Create work and assign a Supervisor.</p>

      <div className="toolbar">
        <input
          className="input search"
          placeholder="Search task or warehouse"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus | 'All')}
        >
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="spacer" />
        <button type="button" className="primary-btn" onClick={onCreate}>Create task</button>
      </div>

      <TaskTable tasks={visible} onOpen={onOpen} />
    </div>
  );
}