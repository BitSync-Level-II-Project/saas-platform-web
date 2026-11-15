import React, { useState, useEffect } from 'react';
import { X, Mail, Copy, Check, ExternalLink, Zap, Send, Loader2, AlertCircle } from 'lucide-react';
import { sendActivationEmail, getGmailComposeUrl } from '../../services/emailService';

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
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    status: 'idle' | 'sending' | 'sent' | 'pending_confirmation' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  // Automatically dispatch real email when modal opens
  useEffect(() => {
    if (isOpen && email && activationUrl) {
      handleSendEmail();
    }
  }, [isOpen, email, activationUrl]);

  if (!isOpen) return null;

  const handleSendEmail = async () => {
    setIsSending(true);
    setEmailStatus({ status: 'sending', message: `Dispatching real email to ${email}...` });

    try {
      const res = await sendActivationEmail({
        toEmail: email,
        managerName,
        workspaceCode,
        activationUrl,
      });

      if (res.success) {
        setEmailStatus({
          status: 'sent',
          message: `Activation email dispatched successfully to ${email}!`,
        });
      } else {
        // FormSubmit first-time authorization check
        if (res.message && res.message.toLowerCase().includes('activation')) {
          setEmailStatus({
            status: 'pending_confirmation',
            message: `Check your Gmail inbox: FormSubmit sent a 1-time "Activate Form" verification to ${email}. Once clicked, all future activation links will arrive instantly.`,
          });
        } else {
          setEmailStatus({
            status: 'error',
            message: res.message || 'Unable to deliver email automatically.',
          });
        }
      }
    } catch {
      setEmailStatus({
        status: 'error',
        message: 'Could not connect to external email service.',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLink = () => {
    window.open(activationUrl, '_blank');
  };

  const handleOpenGmail = () => {
    const url = getGmailComposeUrl({
      toEmail: email,
      managerName,
      workspaceCode,
      activationUrl,
    });
    window.open(url, '_blank');
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
                Sending to your Gmail address
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

        {/* Real Email Dispatch Status Banner */}
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
            emailStatus.status === 'sent'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : emailStatus.status === 'pending_confirmation'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : emailStatus.status === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-violet-50 border-violet-200 text-violet-800'
          }`}
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 shrink-0 animate-spin mt-0.5" />
          ) : emailStatus.status === 'sent' ? (
            <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          ) : emailStatus.status === 'pending_confirmation' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          ) : emailStatus.status === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          ) : (
            <Send className="w-4 h-4 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 text-left">
            <p className="font-semibold">
              {emailStatus.status === 'sent'
                ? 'Email Sent to Inbox!'
                : emailStatus.status === 'pending_confirmation'
                ? 'Check Gmail for 1-Time Verification'
                : emailStatus.status === 'sending'
                ? 'Sending Real Email...'
                : emailStatus.status === 'error'
                ? 'Email Dispatch Notice'
                : 'Ready to send'}
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
              {emailStatus.message || `Sending email to ${email}...`}
            </p>
          </div>

          <button
            type="button"
            disabled={isSending}
            onClick={handleSendEmail}
            className="text-[11px] font-semibold underline shrink-0 hover:opacity-75 cursor-pointer disabled:opacity-50"
          >
            Retry
          </button>
        </div>

        {/* Email Details Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
          <div className="grid grid-cols-[80px_1fr] gap-2 text-slate-600">
            <span className="font-semibold text-slate-500">Recipient:</span>
            <span className="font-semibold text-slate-900 font-mono">{email}</span>
            <span className="font-semibold text-slate-500">Manager:</span>
            <span className="text-slate-800">{managerName}</span>
            <span className="font-semibold text-slate-500">Workspace:</span>
            <span className="font-mono font-semibold text-[#5542f6]">{workspaceCode}</span>
          </div>

          <div className="pt-2 border-t border-slate-200/80">
            <span className="block font-semibold text-slate-700 mb-1">
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

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleOpenGmail}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              title="Open in your Gmail compose window"
            >
              <Send className="w-3.5 h-3.5" />
              Send from my Gmail
            </button>

            <button
              type="button"
              onClick={handleOpenLink}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Activation Page
            </button>
          </div>

          <div className="flex gap-2">
            {onInstantActivate && (
              <button
                type="button"
                onClick={() => {
                  onInstantActivate();
                  onClose();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Instant Activate (Skip Email)
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
