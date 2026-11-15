import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [workspaceCode, setWorkspaceCode] = useState('NOVA-7K3P');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setIsLoading(true);
    try {
      const res = await login(workspaceCode, email, password);
      if (res.success) {
        if (res.role === 'COMPANY_ADMIN') {
          navigate('/admin/overview');
        } else if (res.role === 'MANAGER') {
          navigate('/manager');
        } else {
          navigate('/admin/overview');
        }
      } else {
        setError(res.error || 'Invalid credentials or workspace code.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (role: 'ADMIN' | 'MANAGER') => {
    setWorkspaceCode('NOVA-7K3P');
    if (role === 'ADMIN') {
      setEmail('admin@nova.example');
      setPassword('admin123456');
    } else {
      setEmail('dinesh@nova.example');
      setPassword('manager123456');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[460px] bg-white border border-slate-200/90 rounded-2xl shadow-sm p-8 sm:p-10">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-8">
          Sign in to your organization.
        </p>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Workspace Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Workspace code
            </label>
            <input
              type="text"
              value={workspaceCode}
              onChange={(e) => setWorkspaceCode(e.target.value)}
              placeholder="NOVA-7K3P"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] transition-all bg-white text-slate-900 font-mono uppercase"
              required
            />
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Work email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter work email"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] transition-all bg-white text-slate-900"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] transition-all bg-white text-slate-900"
              required
            />
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={() => alert('Password reset link will be sent to your work email.')}
                className="text-xs font-medium text-[#5542f6] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium py-3 rounded-xl shadow-xs transition-colors cursor-pointer text-sm mt-2 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link
            to="/register-org"
            className="text-sm font-medium text-[#5542f6] hover:underline"
          >
            New organization? Get started
          </Link>
        </div>

        {/* Role-Based Quick Demo Selectors */}
        <div className="mt-8 pt-5 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
            Demo quick sign-in
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectRole('ADMIN')}
              className="inline-flex items-center justify-center gap-1.5 text-xs text-[#5542f6] bg-[#f1efff] hover:bg-[#e7e3ff] py-2 px-3 rounded-xl font-medium transition-colors cursor-pointer border border-[#5542f6]/10"
            >
              <Shield className="w-3.5 h-3.5" />
              Company Admin
            </button>
            <button
              type="button"
              onClick={() => handleSelectRole('MANAGER')}
              className="inline-flex items-center justify-center gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2 px-3 rounded-xl font-medium transition-colors cursor-pointer border border-emerald-600/10"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
