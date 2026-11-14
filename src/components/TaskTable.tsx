import type { Task } from './taskTypes';
import { formatDue, statusClass } from './taskTypes';

interface Props {
  tasks: Task[];
  onOpen: (id: string) => void;
}

export function TaskTable({ tasks, onOpen }: Props) {
  return (
    <div className="card">
      <table className="task-table">
        <thead>
          <tr>
            <th>Task</th>
            <th>Warehouse</th>
            <th>Supervisor</th>
            <th>Due</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>
                <div className="task-title">{t.title}</div>
                <div className="task-code">{t.code}</div>
              </td>
              <td>{t.warehouse}</td>
              <td>{t.supervisor}</td>
              <td>{formatDue(t.dueDate)}</td>
              <td><span className={statusClass(t.status)}>{t.status}</span></td>
              <td>
                <button type="button" className="link-btn" onClick={() => onOpen(t.id)}>Open</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && <p className="table-footer">No tasks found.</p>}
      <p className="table-footer">{tasks.length} records</p>
    </div>
  );
}