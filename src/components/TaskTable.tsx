import type { Task } from './taskTypes';
import { workerName } from './taskTypes';

interface Props {
  tasks: Task[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskTable({ tasks, onView, onEdit, onDelete }: Props) {
  if (tasks.length === 0) return <p className="empty-state">No tasks found.</p>;

  return (
    <table className="task-table">
      <thead>
        <tr>
          <th>Task</th><th>Location</th><th>Priority</th>
          <th>Status</th><th>Assignee</th><th>Due</th><th></th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((t) => (
          <tr key={t.id}>
            <td>
              <button type="button" className="link-button" onClick={() => onView(t.id)}>
                <strong>{t.title}</strong>
              </button>
              <div className="muted">{t.code}</div>
            </td>
            <td>{t.location}</td>
            <td><span className={`pill priority-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
            <td><span className="pill">{t.status}</span></td>
            <td>{workerName(t.assignee)}</td>
            <td>{t.dueDate}</td>
            <td>
              <button type="button" className="link-button" onClick={() => onEdit(t.id)}>Edit</button>
              <button type="button" className="link-button" onClick={() => onDelete(t.id)}>Archive</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}