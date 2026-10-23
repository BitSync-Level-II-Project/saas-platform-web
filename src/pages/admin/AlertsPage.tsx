import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AccountAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  status: 'Open' | 'Resolved';
}

const initialAlerts: AccountAlert[] = [
  {
    id: 'alt-1',
    title: 'Manager activation link expiring soon',
    description: 'Amali Gunasekara was invited 48 hours ago and has not yet completed activation.',
    severity: 'medium',
    timestamp: 'Today, 09:15',
    status: 'Open',
  },
  {
    id: 'alt-2',
    title: 'New organization workspace initialized',
    description: 'Workspace NOVA-7K3P default RBAC roles and policies were provisioned.',
    severity: 'low',
    timestamp: 'Yesterday, 14:20',
    status: 'Resolved',
  },
];

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AccountAlert[]>(initialAlerts);

  const resolveAlert = (id: string) => {
    setAlerts(
      alerts.map((a) => (a.id === id ? { ...a, status: 'Resolved' } : a))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Alerts</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review identity, access violations, and member activation notifications.
        </p>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
              alert.status === 'Open' ? 'border-amber-200/90' : 'border-slate-200/80 opacity-75'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  alert.status === 'Open'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {alert.status === 'Open' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      alert.status === 'Open'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
                <p className="text-[11px] text-slate-400 mt-2">{alert.timestamp}</p>
              </div>
            </div>

            {alert.status === 'Open' && (
              <button
                type="button"
                onClick={() => resolveAlert(alert.id)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Mark Resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};