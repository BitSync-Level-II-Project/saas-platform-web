import React, { useState, useEffect } from 'react';
import {
  Info,
  CheckCircle2,
  AlertCircle,
  Shield,
  UserCog,
  ArrowRightLeft,
  X,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ActivationModal } from '../../components/auth/ActivationModal';

export const OrganizationPage: React.FC = () => {
  const {
    organization,
    updateOrganization,
    primaryAdmin,
    user,
    managers,
    updateAdminProfile,
    transferOwnership,
  } = useAuth();

  const [orgName, setOrgName] = useState(organization?.name || 'Nova Industries');
  const [contactEmail, setContactEmail] = useState(
    organization?.contactEmail || 'admin@nova.example'
  );
  const [phone, setPhone] = useState(organization?.phoneNumber || '+94 11 234 5678');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Edit Profile Form
  const currentAdminUser = primaryAdmin || user;
  const [editName, setEditName] = useState(currentAdminUser?.name || 'Nova Admin');
  const [editEmail, setEditEmail] = useState(currentAdminUser?.email || 'admin@nova.example');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Transfer Ownership Form
  const [transferType, setTransferType] = useState<'existing' | 'new'>('existing');
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [confirmTransferChecked, setConfirmTransferChecked] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Activation modal for new admin invitation
  const [activationModal, setActivationModal] = useState<{
    isOpen: boolean;
    name: string;
    email: string;
    workspaceCode: string;
    activationUrl: string;
  }>({
    isOpen: false,
    name: '',
    email: '',
    workspaceCode: '',
    activationUrl: '',
  });

  const activeManagers = managers.filter((m) => m.status === 'Active');

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name);
      setContactEmail(organization.contactEmail);
      setPhone(organization.phoneNumber);
    }
  }, [organization]);

  useEffect(() => {
    if (currentAdminUser) {
      setEditName(currentAdminUser.name);
      setEditEmail(currentAdminUser.email);
    }
  }, [currentAdminUser]);

  useEffect(() => {
    if (activeManagers.length > 0 && !selectedManagerId) {
      setSelectedManagerId(activeManagers[0].id);
    }
  }, [activeManagers, selectedManagerId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({
      name: orgName.trim(),
      contactEmail: contactEmail.trim(),
      phoneNumber: phone.trim(),
    });
    showToast('Organization details updated successfully!');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    const res = updateAdminProfile({
      name: editName.trim(),
      email: editEmail.trim(),
      password: editPassword.trim() || undefined,
    });

    if (!res.success) {
      setEditError(res.error || 'Failed to update profile.');
      return;
    }

    setEditPassword('');
    setIsEditProfileOpen(false);
    showToast('Administrator profile updated successfully!');
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);

    if (!confirmTransferChecked) {
      setTransferError('Please confirm the acknowledgment checkbox to proceed.');
      return;
    }

    if (transferType === 'existing') {
      if (!selectedManagerId) {
        setTransferError('Please select a manager to promote.');
        return;
      }

      const res = transferOwnership({
        type: 'existing',
        userId: selectedManagerId,
      });

      if (!res.success) {
        setTransferError(res.error || 'Failed to transfer ownership.');
        return;
      }

      setIsTransferModalOpen(false);
      setConfirmTransferChecked(false);
      showToast(
        `Ownership transferred to ${res.newAdminName} (${res.newAdminEmail})! You are now a Manager.`
      );
    } else {
      if (!newAdminName.trim() || !newAdminEmail.trim()) {
        setTransferError('Please enter both name and email.');
        return;
      }

      const res = transferOwnership({
        type: 'new',
        name: newAdminName.trim(),
        email: newAdminEmail.trim(),
      });

      if (!res.success) {
        setTransferError(res.error || 'Failed to initiate transfer.');
        return;
      }

      setIsTransferModalOpen(false);
      setConfirmTransferChecked(false);
      setNewAdminName('');
      setNewAdminEmail('');

      // Open email dispatch activation modal
      if (res.activationUrl) {
        setActivationModal({
          isOpen: true,
          name: res.newAdminName || 'New Admin',
          email: res.newAdminEmail || '',
          workspaceCode: organization?.workspaceCode || 'NOVA-7K3P',
          activationUrl: res.activationUrl,
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs z-50 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization</h1>
        <p className="text-sm text-slate-500 mt-1">
          Company identity, workspace tenant settings, and root ownership management.
        </p>
      </div>

      {/* Card 1: Primary Administrator & Ownership Transfer */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#5542f6]" />
              <h2 className="text-base font-semibold text-slate-900">Primary Administrator</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Root administrator account controlling workspace authorizations, policies, and tenant access.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
            >
              <UserCog className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Profile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTransferError(null);
                setConfirmTransferChecked(false);
                setIsTransferModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#5542f6] bg-[#ede9fe]/70 hover:bg-[#ede9fe] border border-purple-200 transition-colors cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Ownership</span>
            </button>
          </div>
        </div>

        {/* Admin Details Grid */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-3 sm:col-span-2">
            <div className="w-12 h-12 rounded-full bg-[#ede9fe] text-[#5542f6] flex items-center justify-center font-bold text-sm border border-purple-200 shrink-0">
              {currentAdminUser?.avatarInitials || 'NP'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">
                  {currentAdminUser?.name || 'Nova Admin'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#5542f6] tracking-wide">
                  <Shield className="w-3 h-3" />
                  Company Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentAdminUser?.email || organization?.contactEmail || 'admin@nova.example'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600">
            <span className="font-medium text-slate-700 block mb-0.5">Zero-Orphan Policy:</span>
            Every workspace must maintain an active Company Admin. Ownership transfers automatically rotate roles.
          </div>
        </div>
      </div>

      {/* Card 2: Organization Details */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Company Details</h2>
        <p className="text-xs text-slate-500 mb-6">
          Organization metadata and workspace tenant identifier.
        </p>

        <form onSubmit={handleSaveOrg} className="space-y-6">
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
          <div className="pt-2">
            <button
              type="submit"
              className="bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium px-6 py-2.5 rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>

      {/* MODAL 1: Edit Administrator Profile */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ede9fe] text-[#5542f6] flex items-center justify-center font-bold">
                  <UserCog className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Admin Profile</h3>
                  <p className="text-xs text-slate-500">Update your administrator details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email (Login Email)
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password <span className="font-normal text-slate-400">(leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#5542f6] hover:bg-[#4834e0] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Transfer Ownership / Change Admin */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Transfer Workspace Ownership</h3>
                  <p className="text-xs text-slate-500">Reassign the Company Admin role</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Callout */}
            <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Important Notice
              </p>
              <p>
                Transferring ownership reassigns root administrative control of{' '}
                <strong>{organization?.name || 'Nova Industries'}</strong>. The new administrator
                will manage members and organization settings. You will remain in the workspace as a
                Manager.
              </p>
            </div>

            {transferError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            {/* Transfer Type Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTransferType('existing')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  transferType === 'existing'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Promote Existing Manager
              </button>
              <button
                type="button"
                onClick={() => setTransferType('new')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  transferType === 'new'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Invite New Administrator
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              {transferType === 'existing' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Active Manager to Promote
                  </label>
                  {activeManagers.length === 0 ? (
                    <p className="text-xs text-slate-500 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      No other active managers found in this workspace. Please choose "Invite New
                      Administrator" instead.
                    </p>
                  ) : (
                    <select
                      value={selectedManagerId}
                      onChange={(e) => setSelectedManagerId(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                    >
                      {activeManagers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Administrator Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Priyantha Silva"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Administrator Work Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. priyantha@nova.example"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <Mail className="w-3.5 h-3.5 text-[#5542f6]" />
                    An activation email will be physically sent with an ownership handover link.
                  </p>
                </div>
              )}

              {/* Confirmation Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmTransferChecked}
                    onChange={(e) => setConfirmTransferChecked(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#5542f6] focus:ring-[#5542f6]"
                  />
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">
                    I acknowledge that I am transferring organizational control of{' '}
                    <strong>{organization?.name || 'Nova Industries'}</strong> and will step down to
                    the Manager role.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!confirmTransferChecked}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-40 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirm & Transfer Ownership
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activation Modal for New Admin Invitation */}
      <ActivationModal
        isOpen={activationModal.isOpen}
        onClose={() =>
          setActivationModal({
            isOpen: false,
            name: '',
            email: '',
            workspaceCode: '',
            activationUrl: '',
          })
        }
        managerName={activationModal.name}
        email={activationModal.email}
        workspaceCode={activationModal.workspaceCode}
        activationUrl={activationModal.activationUrl}
      />
    </div>
  );
};
