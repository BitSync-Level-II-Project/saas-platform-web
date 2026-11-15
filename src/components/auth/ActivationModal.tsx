import React, { useState } from 'react';
import { X, Mail, Copy, Check, ExternalLink, Zap } from 'lucide-react';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  managerName: string;
  email: string;
  workspaceCode: string;
  activationUrl: string;
  onInstantActivate?: () => void;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  onClose,
  managerName,
  email,
  workspaceCode,
  activationUrl,
  onInstantActivate,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLink = () => {
    window.open(activationUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-[#5542f6] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Activation Email Dispatched
              </h2>
              <p className="text-xs text-slate-500">
                Simulated mail server for local environment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Simulation Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
          <div className="grid grid-cols-[60px_1fr] gap-2 text-slate-600">
            <span className="font-semibold text-slate-500">To:</span>
            <span className="font-medium text-slate-900 font-mono">{email}</span>
            <span className="font-semibold text-slate-500">Name:</span>
            <span className="text-slate-800">{managerName}</span>
            <span className="font-semibold text-slate-500">Workspace:</span>
            <span className="font-mono font-semibold text-[#5542f6]">{workspaceCode}</span>
          </div>

          <div className="pt-2 border-t border-slate-200/80">
            <span className="block font-semibold text-slate-700 mb-1.5">
              Direct Activation Link:
            </span>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2 font-mono text-[11px] text-slate-700 break-all">
              <span className="truncate flex-1">{activationUrl}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded-md hover:bg-slate-100 text-slate-600 flex items-center gap-1 font-sans text-xs font-medium cursor-pointer"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Why this simulated banner */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
          <p className="font-semibold mb-0.5">Why am I seeing this instead of a real Gmail message?</p>
          <p className="text-[11px] text-amber-700">
            The app is currently running in local frontend development mode. Web browsers cannot send physical emails directly to Gmail without a backend mail server (NestJS + SMTP/Resend). You can open or copy the link below, or click <strong>Instant Activate</strong>.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={handleOpenLink}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            Open Activation Page
          </button>

          {onInstantActivate && (
            <button
              type="button"
              onClick={() => {
                onInstantActivate();
                onClose();
              }}
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Instant Activate
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
