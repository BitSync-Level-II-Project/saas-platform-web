import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  // Multi-tenant login fields
  const [workspaceCode, setWorkspaceCode] = useState('NOVA-7K3P');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!workspaceCode.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    // For now, simulate successful login and navigate to admin overview
    navigate('/admin/overview');
  };

  // Quick helper for easy demonstration
  const handleAutoFill = () => {
    setWorkspaceCode('NOVA-7K3P');
    setEmail('admin@nova.example');
    setPassword('admin123456');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
      {/* Centered Login Card */}
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] transition-all bg-white text-slate-900 font-mono"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Password
            </label>
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
            className="w-full bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium py-3 rounded-xl shadow-xs transition-colors cursor-pointer text-sm mt-2"
          >
            Sign In
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              alert('Organization onboarding registration.');
            }}
            className="text-sm font-medium text-[#5542f6] hover:underline"
          >
            New organization? Get started
          </a>
        </div>

        {/* Presentation Demo Auto-Fill */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Presentation demo?</span>
          <button
            type="button"
            onClick={handleAutoFill}
            className="inline-flex items-center gap-1.5 text-xs text-[#5542f6] bg-[#f1efff] hover:bg-[#e7e3ff] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-fill credentials
          </button>
        </div>
      </div>
    </div>
  );
};