import { STATUSES, SUPERVISORS, formatDue, statusClass } from './taskTypes';
import type { Task, TaskStatus } from './taskTypes';

interface Props {
  task: Task;
  onBack: () => void;
  onUpdate: (patch: Partial<Task>) => void;
  onDelete: () => void;
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="readonly">{value || '—'}</div>
    </div>
  );
}

export function TaskDetailsPage({ task, onBack, onUpdate, onDelete }: Props) {
  const handleArchive = () => {
    if (window.confirm('Archive this task?')) onDelete();
  };

  return (
    <div className="page">
      <button type="button" className="back-link" onClick={onBack}>← Tasks</button>
      <h1 className="page-title">{task.title}</h1>
      <p className="page-sub">
        {task.code} · <span className={statusClass(task.status)}>{task.status}</span>
      </p>

      <div className="card form-card">
        <div className="form-row">
          <ReadOnly label="Warehouse" value={`${task.warehouse} warehouse`} />
          <ReadOnly label="Location" value={task.location} />
        </div>
        <div className="form-row">
          <ReadOnly label="Published template" value={task.template} />
          <ReadOnly label="Due" value={formatDue(task.dueDate)} />
        </div>
        <ReadOnly label="Instructions" value={task.instructions} />

        <div className="form-row">
          <div className="field">
            <label>Supervisor (reassign)</label>
            <select
              className="input"
              value={task.supervisor}
              onChange={(e) => onUpdate({ supervisor: e.target.value })}
            >
              {SUPERVISORS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select
              className="input"
              value={task.status}
              onChange={(e) => onUpdate({ status: e.target.value as TaskStatus })}
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="danger-btn" onClick={handleArchive}>Archive task</button>
          <button type="button" className="primary-btn" onClick={onBack}>Done</button>
        </div>
      </div>
    </div>
  );
}