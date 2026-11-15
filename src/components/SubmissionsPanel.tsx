import { useContext, useState } from 'react';
import type { Submission, SubmissionStatus } from './submissionTypes';
import { ReviewContext } from './reviewContext';
import { workers } from './monitorData';

interface Props {
  submissions: Submission[];
  onReview: (id: string, decision: 'Approved' | 'Rejected', note: string) => void;
}

export function SubmissionsPanel({ submissions, onReview }: Props) {
  const { history, reassign } = useContext(ReviewContext);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SubmissionStatus | 'All'>('All');
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [worker, setWorker] = useState('');

  const q = search.toLowerCase();
  const visible = submissions.filter(
    (s) =>
      (s.taskTitle.toLowerCase().includes(q) ||
        s.taskCode.toLowerCase().includes(q) ||
        s.submittedBy.toLowerCase().includes(q)) &&
      (status === 'All' || s.status === status)
  );
  const open = submissions.find((s) => s.id === openId) ?? null;
  const events = open ? history[open.id] ?? [] : [];
  const candidates = open ? workers.filter((w) => w.warehouse === open.warehouse) : [];
  const alreadyReassigned = events.some((e) => e.action === 'Reassigned');

  const openReview = (s: Submission) => {
    setOpenId(s.id);
    setNote(s.reviewNote);
    setWorker(workers.find((w) => w.warehouse === s.warehouse)?.name ?? '');
  };

  const decide = (decision: 'Approved' | 'Rejected') => {
    if (!open) return;
    onReview(open.id, decision, note.trim());
    setOpenId(null);
  };

  const doReassign = () => {
    if (!open || !worker) return;
    reassign(open.id, worker);
    setOpenId(null);
  };

  return (
    <>
      <div className="toolbar">
        <input
          className="input search"
          placeholder="Search task, code or worker"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value as SubmissionStatus | 'All')}
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="card">
        <table className="task-table">
          <thead>
            <tr>
              <th>Submission</th><th>Submitted by</th><th>Warehouse</th><th>Submitted</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="task-title">{s.taskTitle}</div>
                  <div className="task-code">
                    {s.taskCode} · {s.id}{' '}
                    {s.exception && <span className="pill act-offline">Exception</span>}
                  </div>
                </td>
                <td>
                  {s.submittedBy}
                  <div className="task-code">{s.source}</div>
                </td>
                <td>{s.warehouse}</td>
                <td>{s.submittedAt}</td>
                <td><span className={`pill sub-${s.status.toLowerCase()}`}>{s.status}</span></td>
                <td>
                  <button type="button" className="link-btn" onClick={() => openReview(s)}>
                    {s.status === 'Pending' ? 'Review' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && <p className="table-footer">No submissions found.</p>}
        <p className="table-footer">{visible.length} records</p>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpenId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h2>{open.taskTitle}</h2>
                <p className="muted">{open.taskCode} · {open.submittedBy} · {open.submittedAt}</p>
              </div>
              <button type="button" className="icon-btn" aria-label="Close" onClick={() => setOpenId(null)}>×</button>
            </div>

            {open.exception && (
              <div className="notice">A value is outside the configured range. The Supervisor was notified.</div>
            )}

            <div className="data-list">
              {open.data.map((d) => (
                <div key={d.label} className="data-row">
                  <span>{d.label}</span>
                  <strong>{d.value}</strong>
                </div>
              ))}
            </div>

            {open.status === 'Pending' ? (
              <>
                <div className="field">
                  <label>Review note</label>
                  <textarea
                    className="input"
                    placeholder="Required if you reject, so the worker knows what to fix."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="secondary-btn" onClick={() => setOpenId(null)}>Cancel</button>
                  <button type="button" className="danger-btn" disabled={!note.trim()} onClick={() => decide('Rejected')}>
                    Reject
                  </button>
                  <button type="button" className="primary-btn" onClick={() => decide('Approved')}>Approve</button>
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label>Review note</label>
                  <div className="readonly">{open.reviewNote || '—'}</div>
                </div>

                {open.status === 'Rejected' && !alreadyReassigned && (
                  <div className="field">
                    <label>Reassign to</label>
                    <div className="reassign-row">
                      <select className="input" value={worker} onChange={(e) => setWorker(e.target.value)}>
                        {candidates.map((w) => (
                          <option key={w.id} value={w.name}>{w.name} · {w.status}</option>
                        ))}
                      </select>
                      <button type="button" className="primary-btn" disabled={!worker} onClick={doReassign}>
                        Reassign
                      </button>
                    </div>
                  </div>
                )}

                <div className="field">
                  <label>Review history</label>
                  {events.length === 0 ? (
                    <div className="readonly">No review history yet.</div>
                  ) : (
                    <ul className="history-list">
                      {events.map((e, i) => (
                        <li key={i}>
                          <strong>{e.action}</strong> by {e.by}
                          <span className="muted"> · {e.at}</span>
                          {e.note && <div className="muted">{e.note}</div>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="secondary-btn" onClick={() => setOpenId(null)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}