import React, { useState } from 'react';
import { ShieldCheck, Building, Lock, Info } from 'lucide-react';

export const OrganizationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'details' | 'roles'>('details');

  const [orgName, setOrgName] = useState('Nova Industries');
  const [contactEmail, setContactEmail] = useState('admin@nova.example');
  const [phone, setPhone] = useState('+94 11 234 5678');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Organization details saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization</h1>
        <p className="text-sm text-slate-500 mt-1">
          Company details and standard access.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`pb-3 text-sm font-semibold transition-all cursor-pointer relative ${
            activeTab === 'details'
              ? 'text-[#5542f6]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Details
          {activeTab === 'details' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5542f6] rounded-t-md" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`pb-3 text-sm font-semibold transition-all cursor-pointer relative ${
            activeTab === 'roles'
              ? 'text-[#5542f6]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Role permissions
          {activeTab === 'roles' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5542f6] rounded-t-md" />
          )}
        </button>
      </div>

      {/* Tab 1: Details */}
      {activeTab === 'details' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Organization name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] bg-white text-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Contact email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] bg-white text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Phone number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] bg-white text-slate-900"
                  required
                />
              </div>
            </div>

            {/* Fixed Workspace Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Workspace code
              </label>
              <div className="font-mono text-xl font-bold text-slate-900 tracking-wider py-1">
                NOVA-7K3P
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                This code uniquely routes members and mobile field phones to your tenant storage.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium px-6 py-2.5 rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Role Permissions */}
      {activeTab === 'roles' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assigned permissions across M1–M5 modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-[#5542f6]" />
                <h3 className="font-semibold text-sm text-slate-900">Company Admin (M1)</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Full authority over organizational identity, managers, account alerts, and billing.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-700">org:manage</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-700">user:crud</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-700">role:assign</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-sm text-slate-900">Manager (M2, M3, M5)</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Manages warehouses/locations, data templates, and automation rules.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-700">site:crud</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-700">template:crud</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-sm text-slate-900">Supervisor (M2, M4, M5)</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Assigns field tasks, coordinates stationed phones, and reviews submissions.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-700">device:assign</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-700">task:review</span>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-sm text-slate-900">Worker & Stationed Phone</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Mobile collection execution, offline caching, and data synchronization.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-700">task:execute</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-700">sync:upload</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};