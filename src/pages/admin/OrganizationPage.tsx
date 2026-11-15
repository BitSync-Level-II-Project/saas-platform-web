import React, { useState, useEffect } from 'react';
import { Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OrganizationPage: React.FC = () => {
  const { organization, updateOrganization } = useAuth();

  const [orgName, setOrgName] = useState(organization?.name || 'Nova Industries');
  const [contactEmail, setContactEmail] = useState(organization?.contactEmail || 'admin@nova.example');
  const [phone, setPhone] = useState(organization?.phoneNumber || '+94 11 234 5678');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name);
      setContactEmail(organization.contactEmail);
      setPhone(organization.phoneNumber);
    }
  }, [organization]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({
      name: orgName.trim(),
      contactEmail: contactEmail.trim(),
      phoneNumber: phone.trim(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Notification */}
      {isSaved && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs z-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Organization details updated successfully!</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization</h1>
        <p className="text-sm text-slate-500 mt-1">
          Company details and standard access.
        </p>
      </div>

      {/* Organization Details Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 shadow-xs">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Organization Name */}
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

          {/* Contact Email & Phone */}
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

          {/* Immutable Workspace Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Workspace code
            </label>
            <div className="font-mono text-xl font-bold text-slate-900 tracking-wider py-1">
              {organization?.workspaceCode || 'NOVA-7K3P'}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              This code uniquely routes members and mobile field phones to your organization tenant.
            </p>
          </div>

          {/* Save Button */}
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
    </div>
  );
};
