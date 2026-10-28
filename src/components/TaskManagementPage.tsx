import { useState } from 'react';
import type { Dispatch, SetStateAction, FormEvent } from 'react';
import { TaskTable } from './TaskTable';
import { PRIORITIES, workerName } from './taskTypes';
import type { Task, TaskPriority } from './taskTypes';

interface Props {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
}

const emptyForm = { title: '', location: '', priority: 'Medium' as TaskPriority, dueDate: 'Today' };

export function TaskManagementPage({ tasks, setTasks }: Props) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'All'>('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [viewedId, setViewedId] = useState<string | null>(null);

  const viewed = tasks.find((t) => t.id === viewedId) ?? null;

  const visible = tasks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch = t.title.toLowerCase().includes(q) || t.code.toLowerCase().includes(q);
    return matchSearch && (priorityFilter === 'All' || t.priority === priorityFilter);
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setEditingId(id);
    setForm({ title: t.title, location: t.location, priority: t.priority, dueDate: t.dueDate });
    setFormOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      setTasks((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...form } : t)));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        code: `TSK-${1000 + tasks.length + 1}`,
        status: 'Assigned',
        assignee: null,
        ...form,
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Archive this task?')) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <section>
      <div className="section-header">
        <h2>Tasks</h2>
        <button className="create-button" type="button" onClick={openCreate}>Create task</button>
      </div>

      <div className="toolbar">
        <input placeholder="Search by title or code" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'All')}>
          <option value="All">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <TaskTable tasks={visible} onView={setViewedId} onEdit={openEdit} onDelete={handleDelete} />

      {formOpen && (
        <div className="modal-backdrop" onClick={() => setFormOpen(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h3>{editingId ? 'Edit task' : 'Create task'}</h3>
            <label>Title
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label>Location
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </label>
            <label>Due
              <input value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </label>
            <label>Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setFormOpen(false)}>Cancel</button>
              <button type="submit" className="create-button">{editingId ? 'Save' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      {viewed && (
        <div className="modal-backdrop" onClick={() => setViewedId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{viewed.title}</h3>
            <div className="muted">{viewed.code}</div>
            <p><strong>Location:</strong> {viewed.location}</p>
            <p><strong>Priority:</strong> {viewed.priority}</p>
            <p><strong>Status:</strong> {viewed.status}</p>
            <p><strong>Assignee:</strong> {workerName(viewed.assignee)}</p>
            <p><strong>Due:</strong> {viewed.dueDate}</p>
            <div className="modal-actions">
              <button type="button" onClick={() => setViewedId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}