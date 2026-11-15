import React, { useState } from 'react';
import { Search, Plus, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ActivationModal } from '../../components/auth/ActivationModal';
import type { UserStatus } from '../../types';

export const ManagersPage: React.FC = () => {
  const {
    managers,
    addManager,
    resendActivation,
    activateManagerDirectly,
    toggleManagerStatus,
    organization,
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New manager modal inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Activation modal state for dispatched links
  const [activationModal, setActivationModal] = useState<{
    isOpen: boolean;
    managerName: string;
    email: string;
    workspaceCode: string;
    activationUrl: string;
    id?: string;
  }>({
    isOpen: false,
    managerName: '',
    email: '',
    workspaceCode: '',
    activationUrl: '',
  });

  // Filter logic
  const filtered = managers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || m.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const res = addManager(name.trim(), email.trim());
    setName('');
    setEmail('');
    setIsModalOpen(false);

    // Open activation link modal
    setActivationModal({
      isOpen: true,
      managerName: res.name,
      email: res.email,
      workspaceCode: res.workspaceCode,
      activationUrl: res.activationUrl,
      id: res.id,
    });
  };

  const handleResend = (id: string) => {
    const res = resendActivation(id);
    if (res) {
      setActivationModal({
        isOpen: true,
        managerName: res.name,
        email: res.email,
        workspaceCode: res.workspaceCode,
        activationUrl: res.activationUrl,
        id,
      });
    }
  };

  const handleInstantActivate = (id: string, mgrName: string) => {
    activateManagerDirectly(id);
    setToastMessage(`Manager account for ${mgrName} activated successfully!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e8f8f0] text-[#128a50] border border-[#b2e5cb]">
            Active
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff8e6] text-[#b37400] border border-[#fde199]">
            Pending
          </span>
        );
      case 'Deactivated':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Deactivated
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs z-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Managers</h1>
        <p className="text-sm text-slate-500 mt-1">
          Register members, then send their activation email.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 max-w-md gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] bg-white"
            />
          </div>

          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
          >
            <option value="ALL">All statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Deactivated">Deactivated</option>
          </select>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Register Manager
        </button>
      </div>

      {/* Managers Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-[#fafafa]">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Scope
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((mgr) => (
                <tr key={mgr.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-900 text-sm">{mgr.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{mgr.email}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{mgr.scope || 'Organization-wide'}</td>
                  <td className="py-4 px-6">{getStatusBadge(mgr.status)}</td>
                  <td className="py-4 px-6 text-right">
                    {mgr.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleInstantActivate(mgr.id, mgr.name)}
                          className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Activate Now
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResend(mgr.id)}
                          className="text-xs font-medium text-[#5542f6] hover:underline cursor-pointer"
                        >
                          Resend Activation
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleManagerStatus(mgr.id)}
                        className="text-xs font-medium text-[#5542f6] hover:underline cursor-pointer"
                      >
                        {mgr.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                    No managers found matching the search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer count */}
        <div className="py-3 px-6 border-t border-slate-100 bg-[#fafafa] text-xs text-slate-400">
          {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
        </div>
      </div>

      {/* Register Manager Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Register Manager</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adding manager to {organization?.name || 'Nova Industries'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Fernando"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kasun@nova.example"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                  Scope
                </label>
                <input
                  type="text"
                  readOnly
                  value="Organization-wide"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#5542f6] hover:bg-[#4834e0] text-white text-sm font-medium transition-colors shadow-xs"
                >
                  Send Activation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatched Activation Modal */}
      <ActivationModal
        isOpen={activationModal.isOpen}
        onClose={() => setActivationModal((prev) => ({ ...prev, isOpen: false }))}
        managerName={activationModal.managerName}
        email={activationModal.email}
        workspaceCode={activationModal.workspaceCode}
        activationUrl={activationModal.activationUrl}
        onInstantActivate={
          activationModal.id
            ? () => handleInstantActivate(activationModal.id!, activationModal.managerName)
            : undefined
        }
      />
    </div>
  );
};
