import { useState } from 'react';
import { TaskTable } from './TaskTable';
import { ProgressPanel } from './ProgressPanel';
import { SubmissionsPanel } from './SubmissionsPanel';
import { STATUSES } from './taskTypes';
import type { Task, TaskStatus } from './taskTypes';
import type { Submission } from './submissionTypes';

type Tab = 'tasks' | 'progress' | 'submissions';

interface Props {
  tasks: Task[];
  submissions: Submission[];
  onCreate: () => void;
  onOpen: (id: string) => void;
  onReview: (id: string, decision: 'Approved' | 'Rejected', note: string) => void;
}

export function TaskManagementPage({ tasks, submissions, onCreate, onOpen, onReview }: Props) {
  const [tab, setTab] = useState<Tab>('tasks');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TaskStatus | 'All'>('All');

  const pending = submissions.filter((s) => s.status === 'Pending').length;
  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'progress', label: 'Progress' },
    { id: 'submissions', label: 'Submissions', badge: pending },
  ];

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

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.badge ? <span className="tab-badge">{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {tab === 'tasks' && (
        <>
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
        </>
      )}

      {tab === 'progress' && <ProgressPanel tasks={tasks} />}
      {tab === 'submissions' && <SubmissionsPanel submissions={submissions} onReview={onReview} />}
    </div>
  );
}