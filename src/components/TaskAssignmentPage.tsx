import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { WORKERS, workerName } from './taskTypes';
import type { Task } from './taskTypes';

interface Props {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
}

export function TaskAssignmentPage({ tasks, setTasks }: Props) {
  const [filter, setFilter] = useState<'All' | 'Assigned' | 'Unassigned'>('All');
  const [search, setSearch] = useState('');

  const visible = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All' || (filter === 'Assigned' ? t.assignee !== null : t.assignee === null);
    return matchSearch && matchFilter;
  });

  const assign = (taskId: string, workerId: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, assignee: workerId || null, status: workerId ? 'Assigned' : t.status }
          : t
      )
    );

  return (
    <section>
      <div className="section-header"><h2>Task Assignments</h2></div>

      <div className="toolbar">
        <input placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="All">All</option>
          <option value="Assigned">Assigned</option>
          <option value="Unassigned">Unassigned</option>
        </select>
      </div>

      <table className="task-table">
        <thead>
          <tr><th>Task</th><th>Current worker</th><th>Assign / Reassign</th><th></th></tr>
        </thead>
        <tbody>
          {visible.map((t) => (
            <tr key={t.id}>
              <td><strong>{t.title}</strong><div className="muted">{t.code}</div></td>
              <td>{workerName(t.assignee)}</td>
              <td>
                <select value={t.assignee ?? ''} onChange={(e) => assign(t.id, e.target.value)}>
                  <option value="">Select worker</option>
                  {WORKERS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </td>
              <td>
                {t.assignee && (
                  <button type="button" className="link-button" onClick={() => assign(t.id, '')}>Unassign</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {visible.length === 0 && <p className="empty-state">No tasks found.</p>}
    </section>
  );
}