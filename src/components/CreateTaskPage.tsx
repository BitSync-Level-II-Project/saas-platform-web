import { useState } from 'react';
import type { FormEvent } from 'react';
import { LOCATIONS, TEMPLATES, WAREHOUSES, todayIso } from './taskTypes';
import type { NewTask } from './taskTypes';


interface Props {
  supervisors: string[];
  onBack: () => void;
  onCreate: (data: NewTask) => void;
}

export function CreateTaskPage({ supervisors, onBack, onCreate }: Props) {
  const [form, setForm] = useState<NewTask>({
    title: '',
    warehouse: WAREHOUSES[0],
    location: LOCATIONS[0],
    template: TEMPLATES[0],
    supervisor: supervisors[0] ?? '',
    dueDate: todayIso(),
    instructions: '',
  });

  const set = <K extends keyof NewTask>(key: K, value: NewTask[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate({ ...form, title: form.title.trim() });
  };

  return (
    <div className="page">
      <button type="button" className="back-link" onClick={onBack}>← Tasks</button>
      <h1 className="page-title">Create task</h1>
      <p className="page-sub">Assign a clear task to a Supervisor.</p>

      <form className="card form-card" onSubmit={submit}>
        <div className="field">
          <label>Task title</label>
          <input
            className="input"
            placeholder="e.g. Morning equipment check"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label>Warehouse</label>
            <select className="input" value={form.warehouse} onChange={(e) => set('warehouse', e.target.value)}>
              {WAREHOUSES.map((w) => <option key={w} value={w}>{w} warehouse</option>)}
            </select>
          </div>
          <div className="field">
            <label>Location</label>
            <select className="input" value={form.location} onChange={(e) => set('location', e.target.value)}>
              {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label>Published template</label>
            <select className="input" value={form.template} onChange={(e) => set('template', e.target.value)}>
              {TEMPLATES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Supervisor</label>
            <select className="input" value={form.supervisor} onChange={(e) => set('supervisor', e.target.value)}>
              {supervisors.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="field">
            <label>Due date</label>
            <input type="date" className="input" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </div>
          <div className="field">
            <label>Instructions</label>
            <input
              className="input"
              placeholder="e.g. Read display and attach a clear photo."
              value={form.instructions}
              onChange={(e) => set('instructions', e.target.value)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="secondary-btn" onClick={onBack}>Cancel</button>
          <button type="submit" className="primary-btn">Create task</button>
        </div>
      </form>
    </div>
  );
}