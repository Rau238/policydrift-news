'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Globe, HelpCircle, Loader2, Sparkles, Trash2, X } from 'lucide-react';

export type ConfirmDialogState = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  intent?: 'primary' | 'danger' | 'warning' | 'success';
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
};

type Props = {
  dialog: ConfirmDialogState | null;
  onClose: () => void;
};

export function AdminConfirmModal({ dialog, onClose }: Props) {
  useEffect(() => {
    if (!dialog?.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !dialog.isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog, onClose]);

  if (!dialog?.isOpen) return null;

  const intent = dialog.intent || 'primary';

  const intentConfig = {
    primary: {
      icon: <Sparkles className="h-6 w-6 text-teal-400" />,
      iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-400',
      confirmBtn: 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-teal-500/20',
    },
    success: {
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-400" />,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      confirmBtn: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20',
    },
    danger: {
      icon: <Trash2 className="h-6 w-6 text-rose-400" />,
      iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      confirmBtn: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-500/20',
    },
    warning: {
      icon: <AlertCircle className="h-6 w-6 text-amber-400" />,
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      confirmBtn: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20',
    },
  }[intent];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => {
        if (!dialog.isLoading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-b from-[#131d31] via-[#0f172a] to-[#0b101b] p-6 shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon Button */}
        {!dialog.isLoading && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Content Header */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-inner ${intentConfig.iconBg}`}
          >
            {intentConfig.icon}
          </div>
          <div className="min-w-0 pr-4">
            <h3 className="font-display text-lg font-bold text-white tracking-tight">
              {dialog.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
              {dialog.message}
            </p>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          <button
            type="button"
            disabled={dialog.isLoading}
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white active:scale-95 disabled:opacity-50"
          >
            {dialog.cancelText || 'Cancel'}
          </button>

          <button
            type="button"
            disabled={dialog.isLoading}
            onClick={async () => {
              await dialog.onConfirm();
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 ${intentConfig.confirmBtn}`}
          >
            {dialog.isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{dialog.confirmText || 'Confirm Action'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
