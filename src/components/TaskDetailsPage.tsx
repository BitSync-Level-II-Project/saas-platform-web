import { useState } from 'react';
import { Smartphone, User } from 'lucide-react';
import { STATUSES, formatDue, statusClass } from './taskTypes';
import type { AssigneeType, Task, TaskStatus } from './taskTypes';
import { PHONES, captureModeOf } from './assignmentData';
import { workers } from './monitorData';

interface Props {
  task: Task;
  supervisors: string[];
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

export function TaskDetailsPage({ task, supervisors, onBack, onUpdate, onDelete }: Props) {
  const mode = captureModeOf(task.template);
  const needsSensor = mode === 'Automatic sensor & audio';
  const warehouseWorkers = workers.filter((w) => w.warehouse === task.warehouse);
  const phone = PHONES.find((p) => p.warehouse === task.warehouse && p.location === task.location);
  const phoneUsable = !!phone && phone.available;

  const [choice, setChoice] = useState<AssigneeType | null>(task.assigneeType);
  const [workerName, setWorkerName] = useState(
    task.assigneeType === 'Worker' && task.assignee ? task.assignee : warehouseWorkers[0]?.name ?? ''
  );
    const [title, setTitle] = useState(task.title);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [instructions, setInstructions] = useState(task.instructions);
  const changed =
    title.trim() !== '' &&
    (title !== task.title || dueDate !== task.dueDate || instructions !== task.instructions);
  const saveChanges = () => onUpdate({ title: title.trim(), dueDate, instructions });

  const canSave =
    choice === 'Worker' ? !needsSensor && !!workerName : choice === 'Stationed phone' ? phoneUsable : false;

  const saveAssignment = () => {
    if (!canSave) return;
    if (choice === 'Worker') onUpdate({ assigneeType: 'Worker', assignee: workerName });
    else if (phone) onUpdate({ assigneeType: 'Stationed phone', assignee: phone.name });
  };

  const unassign = () => {
    onUpdate({ assigneeType: null, assignee: null });
    setChoice(null);
  };

  const handleArchive = () => {
    if (window.confirm('Archive this task?')) onDelete();
  };

  const assignedText = task.assignee ? `${task.assignee} (${task.assigneeType})` : 'Not assigned yet';

  return (
    <div className="page">
      <button type="button" className="back-link" onClick={onBack}>← Tasks</button>
      <h1 className="page-title">{task.title}</h1>
            <p className="page-sub">
        {task.code} · <span className={statusClass(task.status)}>{task.status}</span> · Due {formatDue(task.dueDate)}
      </p>

      <div className="card form-card">
          <div className="field">
          <label>Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-row">
          <ReadOnly label="Warehouse" value={`${task.warehouse} warehouse`} />
          <ReadOnly label="Location" value={task.location} />
        </div>
        <div className="form-row">
          <ReadOnly label="Published template" value={task.template} />
          <ReadOnly label="Capture mode" value={mode} />
        </div>
                <div className="form-row">
          <div className="field">
            <label>Due date</label>
            <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <ReadOnly label="Completed by" value={assignedText} />
        </div>
        <div className="field">
          <label>Instructions</label>
          <textarea className="input" rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
        </div>
        <div className="form-actions">
          <button type="button" className="primary-btn" disabled={!changed} onClick={saveChanges}>
            Save changes
          </button>
        </div>

        <div className="form-row">
          <div className="field">
            <label>Supervisor (reassign)</label>
            <select
              className="input"
              value={task.supervisor}
              onChange={(e) => onUpdate({ supervisor: e.target.value })}
            >
              {[...new Set([task.supervisor, ...supervisors])].map((s) => <option key={s}>{s}</option>)}
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
      </div>

      <h2 className="section-title">Who will complete this task?</h2>
      <p className="section-sub">
        {needsSensor
          ? 'This template requires automatic sensing at its registered location.'
          : 'Choose a worker, or the stationed phone at this location.'}
      </p>

      <div className="choice-grid">
        <div
          className={`choice-card ${choice === 'Worker' ? 'selected' : ''} ${needsSensor ? 'disabled' : ''}`}
          onClick={() => !needsSensor && setChoice('Worker')}
        >
          <div className="choice-head">
            <User size={24} />
            <h3>Worker</h3>
          </div>
          {needsSensor ? (
            <>
              <p><strong>Not compatible with this template.</strong></p>
              <p className="muted">A fixed phone captures the configured sensor and audio data.</p>
            </>
          ) : warehouseWorkers.length === 0 ? (
            <p className="muted">No workers are registered at this warehouse.</p>
          ) : (
            <>
              <p className="muted">Workers at {task.warehouse} warehouse</p>
              <select
                className="input"
                value={workerName}
                onChange={(e) => { setWorkerName(e.target.value); setChoice('Worker'); }}
              >
                {warehouseWorkers.map((w) => (
                  <option key={w.id} value={w.name}>{w.name} · {w.status}</option>
                ))}
              </select>
            </>
          )}
        </div>

        <div
          className={`choice-card ${choice === 'Stationed phone' ? 'selected' : ''} ${phoneUsable ? '' : 'disabled'}`}
          onClick={() => phoneUsable && setChoice('Stationed phone')}
        >
          <div className="choice-head">
            <Smartphone size={24} />
            <h3>Stationed phone</h3>
            {phone && (
              <span className={`pill ${phone.available ? 'sup-active' : 'sup-pending'}`}>
                {phone.available ? 'Available' : 'Busy'}
              </span>
            )}
          </div>
          {phone ? (
            <>
              <p>{phone.sensors}.</p>
              <p className="muted">Paired phone at {phone.warehouse} / {phone.location}</p>
            </>
          ) : (
            <p className="muted">No stationed phone is paired at {task.warehouse} / {task.location}.</p>
          )}
        </div>
      </div>

      <div className="form-actions">
        {task.assigneeType && (
          <button type="button" className="secondary-btn" onClick={unassign}>Unassign</button>
        )}
        <button type="button" className="primary-btn" disabled={!canSave} onClick={saveAssignment}>
          Save assignment
        </button>
      </div>

      <div className="form-actions detail-footer">
        <button type="button" className="danger-btn" onClick={handleArchive}>Archive task</button>
        <button type="button" className="secondary-btn" onClick={onBack}>Done</button>
      </div>
    </div>
  );
}