import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Eye, EyeOff, Lock, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ActivateAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activateAccount, login } = useAuth();

  const workspaceCode = searchParams.get('ws') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!workspaceCode || !email) {
      setError('Invalid or incomplete activation link. Missing workspace or email.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = activateAccount(workspaceCode, email, password);
      if (!res.success) {
        setError(res.error || 'Failed to activate account.');
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);

      // Auto sign-in and redirect to appropriate portal
      setTimeout(async () => {
        let destinationRole = res.role || 'MANAGER';
        try {
          const loginRes = await login(workspaceCode, email, password);
          if (loginRes.role) destinationRole = loginRes.role as any;
        } catch {
          // already authenticated by activateAccount
        }

        if (destinationRole === 'COMPANY_ADMIN') {
          navigate('/admin');
        } else {
          navigate('/manager');
        }
      }, 1000);
    } catch {
      setError('An unexpected error occurred during activation.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[460px] bg-white border border-slate-200/90 rounded-2xl shadow-sm p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#ede9fe] text-[#5542f6] flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Activate Account
            </h1>
            <p className="text-xs text-slate-500">
              Set your password to complete activation
            </p>
          </div>
        </div>

        {/* Workspace Info Card */}
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <Building2 className="w-4 h-4 text-[#5542f6]" />
            <span>Workspace: <span className="font-mono font-semibold uppercase">{workspaceCode || 'NOVA-7K3P'}</span></span>
          </div>
          <p className="text-slate-500">
            Invited account: <strong className="text-slate-700">{email || 'Not specified'}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Account Activated!
            </h2>
            <p className="text-xs text-slate-500">
              Signing you into your Manager portal now...
            </p>
          </div>
        ) : (
          <form onSubmit={handleActivate} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Create password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] bg-white text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Confirm password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] bg-white text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium py-3 rounded-xl text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Activating account...' : 'Activate & Sign In'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-xs font-medium text-[#5542f6] hover:underline"
          >
            Already activated? Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
