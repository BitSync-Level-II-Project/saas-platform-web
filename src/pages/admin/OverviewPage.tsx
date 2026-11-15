import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OverviewPage: React.FC = () => {
  const { organization, managers, activityLogs, addManager } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Derived counts from AuthContext
  const activeCount = managers.filter((m) => m.status === 'Active').length;
  const pendingCount = managers.filter((m) => m.status === 'Pending').length;
  const alertCount = 1;

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    addManager(newName.trim(), newEmail.trim());
    setToastMessage(`Manager ${newName.trim()} registered. Activation email sent.`);
    setNewName('');
    setNewEmail('');
    setIsModalOpen(false);

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs z-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Company overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your organization and account access.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <p className="text-sm font-medium text-slate-600">Active Managers</p>
          <p className="text-4xl font-bold text-slate-900 mt-4 tracking-tight">{activeCount}</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <p className="text-sm font-medium text-slate-600">Pending activation</p>
          <p className="text-4xl font-bold text-slate-900 mt-4 tracking-tight">{pendingCount}</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <p className="text-sm font-medium text-slate-600">Account alerts</p>
          <p className="text-4xl font-bold text-slate-900 mt-4 tracking-tight">{alertCount}</p>
        </div>
      </div>

      {/* Action Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Your organization is ready
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {organization?.name || 'Nova Industries'} · Workspace {organization?.workspaceCode || 'NOVA-7K3P'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shrink-0"
        >
          Register Manager
        </button>
      </div>

      {/* Recent Activity Table */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">
          Recent account activity
        </h2>

        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-[#fafafa]">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  When
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-900 text-sm">{log.memberName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{log.memberRole}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{log.activity}</td>
                  <td className="py-4 px-6 text-sm text-slate-400 text-right whitespace-nowrap">
                    {log.when}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Manager */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Register New Manager</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kasun Fernando"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                  Work Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. kasun@nova.example"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium bg-[#5542f6] hover:bg-[#4834e0] text-white rounded-xl shadow-xs"
                >
                  Register & Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
