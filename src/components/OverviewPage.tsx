import { useEffect, useState } from 'react';
import { warehouseProgress as defaultProgress } from './monitorData';
import type { WarehouseProgress } from './monitorData';
import { warehouseService } from '../services/warehouseService';
import type { Task } from './taskTypes';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

interface OverviewPageProps {
  tasks?: Task[];
}

export function OverviewPage({ tasks = [] }: OverviewPageProps) {
  const [progress, setProgress] = useState<WarehouseProgress[]>(defaultProgress);

  useEffect(() => {
    let isCancelled = false;

    warehouseService
      .getWarehouses('', 'Active', 1, 100)
      .then((res) => {
        if (isCancelled) return;
        if (res.items && res.items.length > 0) {
          const liveProgress: WarehouseProgress[] = res.items.map((w) => {
            const whTasks = tasks.filter(
              (t) => t.warehouse.toLowerCase() === w.name.toLowerCase(),
            );
            const completed = whTasks.filter((t) => t.status === 'Complete').length;
            const total = whTasks.length;

            return {
              warehouse: w.name,
              locations: w.locations,
              supervisor: w.supervisor || 'Unassigned',
              completed,
              total,
              openAlerts: 0,
              recordsReceived: w.locations * 8,
            };
          });

          setProgress(liveProgress);
        }
      })
      .catch(() => {
        // Fallback to defaultProgress if backend is offline
      });

    return () => {
      isCancelled = true;
    };
  }, [tasks]);

  const stats = [
    { label: 'Active warehouses', value: progress.length },
    { label: 'Tasks underway', value: sum(progress.map((w) => w.total - w.completed)) },
    { label: 'Open alerts', value: sum(progress.map((w) => w.openAlerts)) },
    { label: 'Records received', value: sum(progress.map((w) => w.recordsReceived)) },
  ];
  const alertWarehouse = progress.find((w) => w.openAlerts > 0);

  return (
    <div className="page">
      <h1 className="page-title">Operations overview</h1>
      <p className="page-sub">A clear view of your sites and work.</p>

      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="card stat-card">
            <span>{s.label}</span>
            <strong>{s.value}</strong>
          </div>
        ))}
      </div>

      {alertWarehouse && (
        <div className="card alert-card">
          <div>
            <h3>Equipment reading outside range</h3>
            <p className="muted">{alertWarehouse.warehouse} warehouse · Supervisor notified</p>
          </div>
          <button type="button" className="secondary-btn">View alert</button>
        </div>
      )}

      <h2 className="section-title">Work across your warehouses</h2>
      <div className="card">
        <table className="task-table">
          <thead>
            <tr><th>Warehouse</th><th>Supervisor</th><th>Tasks complete</th><th>Attention</th></tr>
          </thead>
          <tbody>
            {progress.map((w) => (
              <tr key={w.warehouse}>
                <td>
                  <div className="task-title">
                    {w.warehouse.toLowerCase().endsWith('warehouse')
                      ? w.warehouse
                      : `${w.warehouse} warehouse`}
                  </div>
                  <div className="task-code">{w.locations} locations</div>
                </td>
                <td>{w.supervisor}</td>
                <td>{w.completed} of {w.total}</td>
                <td>
                  {w.openAlerts > 0
                    ? <span className="link-btn">{w.openAlerts} open alerts</span>
                    : <span className="muted">No alerts</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted summary-line">Detailed progress and worker activity are under Tasks → Progress.</p>
    </div>
  );
}
