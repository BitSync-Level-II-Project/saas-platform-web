import { useState } from 'react';
import type { FormEvent } from 'react';
import { WAREHOUSES } from './taskTypes';
import type { NewSupervisor, Supervisor, SupervisorStatus } from './supervisorTypes';

interface Props {
  supervisors: Supervisor[];
  onRegister: (data: NewSupervisor) => void;
  onSendActivation: (id: string) => void;
}

const emptyForm: NewSupervisor = { name: '', email: '', warehouse: WAREHOUSES[0] };

export function SupervisorsPage({ supervisors, onRegister, onSendActivation }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SupervisorStatus | 'All'>('All');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewSupervisor>(emptyForm);
  const [notice, setNotice] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);

  const q = search.toLowerCase();
  const visible = supervisors.filter(
    (s) =>
      (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) &&
      (status === 'All' || s.status === status)
  );
  const account = supervisors.find((s) => s.id === accountId) ?? null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onRegister({ ...form, name: form.name.trim(), email: form.email.trim() });
    setForm(emptyForm);
    setOpen(false);
  };

  const sendActivation = (s: Supervisor) => {
    onSendActivation(s.id);
    setNotice(`Activation email sent to ${s.email}.`);
  };

  return (
    <div className="page">
      <div className="section-head">
        <div>
          <h1 className="page-title">Supervisors</h1>
          <p className="page-sub">Register and manage the Supervisors responsible for your warehouses.</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => setOpen(true)}>Register Supervisor</button>
      </div>

      {notice && (
        <div className="notice ok-notice">
          {notice}
          <button type="button" className="link-btn" onClick={() => setNotice('')}>Dismiss</button>
        </div>
      )}

      <div className="toolbar">
        <input
          className="input search"
          placeholder="Search name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value as SupervisorStatus | 'All')}
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
        </select>
        <div className="spacer" />
        <strong>{supervisors.length} Supervisors</strong>
      </div>

      <div className="card">
        <table className="task-table">
          <thead>
            <tr><th>Supervisor</th><th>Warehouse</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="task-title">{s.name}</div>
                  <div className="task-code">{s.email}</div>
                </td>
                <td>{s.warehouse} warehouse</td>
                <td><span className={`pill sup-${s.status.toLowerCase()}`}>{s.status}</span></td>
                <td>
                  {s.status === 'Active' ? (
                    <button type="button" className="link-btn" onClick={() => setAccountId(s.id)}>
                      View account
                    </button>
                  ) : s.activationSent ? (
                    <span className="muted">Activation sent</span>
                  ) : (
                    <button type="button" className="link-btn" onClick={() => sendActivation(s)}>
                      Send activation
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="table-footer">No supervisors found.</p>}
        <p className="table-footer">{visible.length} records</p>
      </div>

      {account && (
        <div className="modal-backdrop" onClick={() => setAccountId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{account.name}</h2>
              <button type="button" className="icon-btn" aria-label="Close" onClick={() => setAccountId(null)}>×</button>
            </div>
            <div className="data-list">
              <div className="data-row"><span>Role</span><strong>Supervisor</strong></div>
              <div className="data-row"><span>Work email</span><strong>{account.email}</strong></div>
              <div className="data-row"><span>Warehouse</span><strong>{account.warehouse} warehouse</strong></div>
              <div className="data-row"><span>Status</span><strong>{account.status}</strong></div>
            </div>
            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={() => setAccountId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <div className="modal-head">
              <h2>Register Supervisor</h2>
              <button type="button" className="icon-btn" aria-label="Close" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="field">
              <label>Full name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Work email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="field">
              <label>Warehouse</label>
              <select className="input" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })}>
                {WAREHOUSES.map((w) => <option key={w} value={w}>{w} warehouse</option>)}
              </select>
            </div>
            <p className="muted">Register first, then send the activation email.</p>
            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit" className="primary-btn">Register</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}