import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // All fields initialize strictly empty
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Controlled editable state to thwart Chrome/Edge aggressive credential autofill on load
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    setWorkspaceCode('');
    setEmail('');
    setPassword('');
    setError(null);

    // Unblock editing after initial browser autofill evaluation
    const timer = setTimeout(() => {
      setIsEditable(true);
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!workspaceCode.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in workspace code, work email, and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(workspaceCode, email, password);
      if (res.success) {
        // Automatically route to the relevant overview according to detected role
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

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          {/* Off-screen dummy inputs to absorb browser autofill heuristics */}
          <div
            style={{
              position: 'absolute',
              top: '-9999px',
              left: '-9999px',
              opacity: 0,
              height: 0,
              width: 0,
              overflow: 'hidden',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <input type="text" name="fake_user_field" tabIndex={-1} autoComplete="off" />
            <input type="password" name="fake_pwd_field" tabIndex={-1} autoComplete="off" />
          </div>

          {/* Workspace Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
              Workspace code
            </label>
            <input
              type="text"
              name="st_ws_id"
              autoComplete="off"
              readOnly={!isEditable}
              onFocus={(e) => {
                e.target.readOnly = false;
              }}
              value={workspaceCode}
              onChange={(e) => setWorkspaceCode(e.target.value)}
              placeholder="e.g. NOVA-7K3P"
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
              type="text"
              inputMode="email"
              name="st_acc_email"
              autoComplete="off"
              readOnly={!isEditable}
              onFocus={(e) => {
                e.target.readOnly = false;
              }}
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="st_acc_secret"
                autoComplete="new-password"
                readOnly={!isEditable}
                onFocus={(e) => {
                  e.target.readOnly = false;
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] transition-all bg-white text-slate-900"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#5542f6] hover:underline"
              >
                Forgot password?
              </Link>
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
      </div>
    </div>
  );
};
