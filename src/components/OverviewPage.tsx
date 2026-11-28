import { warehouseProgress } from './monitorData';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export function OverviewPage() {
  const stats = [
    { label: 'Active warehouses', value: warehouseProgress.length },
    { label: 'Tasks underway', value: sum(warehouseProgress.map((w) => w.total - w.completed)) },
    { label: 'Open alerts', value: sum(warehouseProgress.map((w) => w.openAlerts)) },
    { label: 'Records received', value: sum(warehouseProgress.map((w) => w.recordsReceived)) },
  ];
  const alertWarehouse = warehouseProgress.find((w) => w.openAlerts > 0);

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
            {warehouseProgress.map((w) => (
              <tr key={w.warehouse}>
                <td>
                  <div className="task-title">{w.warehouse} warehouse</div>
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