import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowLeft, CheckCircle2, Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterOrgPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerOrganization } = useAuth();

  const [orgName, setOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const { workspaceCode } = registerOrganization({
      name: orgName.trim(),
      adminName: adminName.trim(),
      email: adminEmail.trim(),
      phone: phone.trim(),
      password: password.trim(),
    });

    setCreatedCode(workspaceCode);
  };

  const handleCopyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[500px] bg-white border border-slate-200/90 rounded-2xl shadow-sm p-8 sm:p-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>

        {!createdCode ? (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#ede9fe] text-[#5542f6]">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Create new organization
                </h1>
                <p className="text-xs text-slate-500">
                  BitSync multi-tenant operational workspace
                </p>
              </div>
            </div>

            <form onSubmit={handleRegister} autoComplete="off" className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                  Organization Name
                </label>
                <input
                  type="text"
                  name="organization_name"
                  autoComplete="off"
                  placeholder="e.g. Apex Logistics"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Admin Full Name
                  </label>
                  <input
                    type="text"
                    name="admin_full_name"
                    autoComplete="off"
                    placeholder="e.g. Nimal Perera"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    name="admin_phone"
                    autoComplete="off"
                    placeholder="+94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                  Admin Work Email
                </label>
                <input
                  type="email"
                  name="org_admin_email"
                  autoComplete="new-password"
                  placeholder="admin@apex.example"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  name="org_admin_password"
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium py-3 rounded-xl text-sm shadow-xs transition-colors cursor-pointer mt-4"
              >
                Create Organization & Workspace
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Organization is ready!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your multi-tenant workspace was provisioned for <strong>{orgName}</strong>.
              </p>
            </div>

            {/* Generated Workspace Code Card */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 text-left space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Your Workspace Code
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-[#5542f6] tracking-wider">
                  {createdCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Share this workspace code with your warehouse workers and supervisors so they can sign in.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium py-3 rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
            >
              Sign In to Your Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
