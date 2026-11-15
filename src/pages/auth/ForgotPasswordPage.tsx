import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { requestPasswordReset } = useAuth();

  const [workspaceCode, setWorkspaceCode] = useState('NOVA-7K3P');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!workspaceCode.trim() || !email.trim()) {
      setError('Please provide both your workspace code and work email.');
      return;
    }

    setIsLoading(true);
    const res = requestPasswordReset(workspaceCode, email);
    setIsLoading(false);

    if (res.success) {
      setIsSubmitted(true);
    } else {
      setError(res.error || 'Account could not be located in this workspace.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-[460px] bg-white border border-slate-200/90 rounded-2xl shadow-sm p-8 sm:p-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>

        {!isSubmitted ? (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-[#ede9fe] text-[#5542f6]">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Reset password
                </h1>
                <p className="text-xs text-slate-500">
                  Enter your details to receive password recovery instructions.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Workspace code
                </label>
                <input
                  type="text"
                  placeholder="e.g. NOVA-7K3P"
                  value={workspaceCode}
                  onChange={(e) => setWorkspaceCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6] font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Work email
                </label>
                <input
                  type="email"
                  placeholder="Enter your registered work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium py-3 rounded-xl shadow-xs transition-colors cursor-pointer text-sm mt-2 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send reset instructions'}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <MailCheck className="w-7 h-7" />
            </div>

            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Check your email
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              We have sent password reset instructions to <strong className="text-slate-700">{email}</strong>. Please check your inbox and spam folder.
            </p>

            <div className="pt-4">
              <Link
                to="/login"
                className="inline-block w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-xl text-xs transition-colors"
              >
                Return to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
