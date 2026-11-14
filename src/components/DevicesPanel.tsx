import { useEffect, useState } from 'react';
import { PHONES } from './assignmentData';

interface Metric { battery: number; signal: number; readings: number; }

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const initial = (): Record<string, Metric> =>
  Object.fromEntries(
    PHONES.map((p, i) => [p.id, { battery: 92 - i * 20, signal: 4 - (i % 3), readings: 120 + i * 35 }])
  );

export function DevicesPanel() {
  const [metrics, setMetrics] = useState<Record<string, Metric>>(initial);
  const [updated, setUpdated] = useState(new Date());

  // Mock polling. In the real system this will call the backend every few seconds.
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((prev) => {
        const next: Record<string, Metric> = {};
        PHONES.forEach((p) => {
          const m = prev[p.id];
          const drift = Math.random() < 0.2 ? (Math.random() < 0.5 ? -1 : 1) : 0;
          next[p.id] = {
            battery: clamp(m.battery - (Math.random() < 0.3 ? 1 : 0), 5, 100),
            signal: clamp(m.signal + drift, 1, 4),
            readings: m.readings + Math.floor(Math.random() * 3),
          };
        });
        return next;
      });
      setUpdated(new Date());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card">
      <h2 className="section-title">Stationed devices</h2>
      <p className="section-sub">
        Updated {updated.toLocaleTimeString()} · refreshes every 5 seconds
      </p>
      <table className="dev-table">
        <thead>
          <tr>
            <th>Device</th>
            <th>Site</th>
            <th>Sensors</th>
            <th>Status</th>
            <th>Battery</th>
            <th>Signal</th>
            <th>Readings today</th>
          </tr>
        </thead>
        <tbody>
          {PHONES.map((p) => {
            const m = metrics[p.id];
            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.warehouse} / {p.location}</td>
                <td>{p.sensors}</td>
                <td>
                  <span className={`pill ${p.available ? 'sup-active' : 'sup-pending'}`}>
                    {p.available ? 'Available' : 'Busy'}
                  </span>
                </td>
                <td>{m.battery}%</td>
                <td>{'▮'.repeat(m.signal)}{'▯'.repeat(4 - m.signal)}</td>
                <td>{m.readings}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}