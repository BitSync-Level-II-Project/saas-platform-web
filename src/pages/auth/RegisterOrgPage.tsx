import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';

export const RegisterOrgPage: React.FC = () => {
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Generates a workspace code from the org name (e.g. NOVA-7K3P)
  const generateWorkspaceCode = (name: string) => {
    const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'SYNC';
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${rand}`;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const code = generateWorkspaceCode(orgName);

    alert(`Organization created!\nYour Workspace Code is: ${code}\nPlease sign in with your new workspace code.`);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[500px] bg-white border border-slate-200/90 rounded-2xl shadow-sm p-8 sm:p-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-[#ede9fe] text-[#5542f6]">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Create new organization</h1>
            <p className="text-xs text-slate-500">BitSync multi-tenant operational workspace</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
              Organization Name
            </label>
            <input
              type="text"
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
    </div>
  );
};