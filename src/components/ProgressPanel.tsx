import { DevicesPanel } from './DevicesPanel';
import { useState } from 'react';
import type { Task } from './taskTypes';
import { warehouseProgress, workers } from './monitorData';
import type { Activity } from './monitorData';

export function ProgressPanel({ tasks }: { tasks: Task[] }) {
  const [warehouse, setWarehouse] = useState('All');

  const counts = [
    { label: 'Assigned', value: tasks.filter((t) => t.status === 'Assigned').length },
    { label: 'In progress', value: tasks.filter((t) => t.status === 'In progress').length },
    { label: 'Complete', value: tasks.filter((t) => t.status === 'Complete').length },
  ];

  const shown = workers.filter((w) => warehouse === 'All' || w.warehouse === warehouse);
  const count = (a: Activity) => shown.filter((w) => w.status === a).length;

  return (
    <>
      <div className="stat-grid three">
        {counts.map((c) => (
          <div key={c.label} className="card stat-card">
            <span>{c.label}</span>
            <strong>{c.value}</strong>
          </div>
        ))}
      </div>

      <h2 className="section-title first">Progress by warehouse</h2>
      <div className="card">
        <table className="task-table">
          <thead>
            <tr>
              <th>Warehouse</th><th>Supervisor</th><th>Tasks complete</th><th>Open alerts</th><th>Records received</th>
            </tr>
          </thead>
          <tbody>
            {warehouseProgress.map((w) => {
              const pct = Math.round((w.completed / w.total) * 100);
              return (
                <tr key={w.warehouse}>
                  <td>
                    <div className="task-title">{w.warehouse} warehouse</div>
                    <div className="task-code">{w.locations} locations</div>
                  </td>
                  <td>{w.supervisor}</td>
                  <td>
                    <div>{w.completed} of {w.total}</div>
                    <div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                  </td>
                  <td>
                    {w.openAlerts > 0
                      ? <span className="link-btn">{w.openAlerts} open alerts</span>
                      : <span className="muted">No alerts</span>}
                  </td>
                  <td>{w.recordsReceived}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="section-head">
        <h2 className="section-title">Worker activity</h2>
        <select className="input status-filter" value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
          <option value="All">All warehouses</option>
          {warehouseProgress.map((w) => (
            <option key={w.warehouse} value={w.warehouse}>{w.warehouse} warehouse</option>
          ))}
        </select>
      </div>
      <p className="muted summary-line">
        {count('Active')} active · {count('Idle')} idle · {count('Offline')} offline
      </p>
      <div className="card">
        <table className="task-table">
          <thead>
            <tr>
              <th>Worker</th><th>Warehouse</th><th>Current task</th><th>Status</th><th>Last sync</th><th>Done today</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((w) => (
              <tr key={w.id}>
                <td className="task-title">{w.name}</td>
                <td>{w.warehouse}</td>
                <td>{w.currentTask ?? <span className="muted">No task</span>}</td>
                <td><span className={`pill act-${w.status.toLowerCase()}`}>{w.status}</span></td>
                <td>{w.lastSync}</td>
                <td>{w.doneToday}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="table-footer">
          {shown.length} workers. Offline workers keep submissions on the device and sync when they are back online.
        </p>
      </div>
    </>
  );
}