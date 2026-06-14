import React from 'react';
import type { AnalysisShareData } from '../../types/analysis';

type Props = {
  isOpen: boolean;
  shareData: AnalysisShareData | null;
  isCreating: boolean;
  isRevoking: boolean;
  error: string | null;
  copied: boolean;
  expiresInDays: number | null;
  onExpiresInDaysChange: (value: number | null) => void;
  onCreateShare: () => void;
  onCopyShare: () => void;
  onRevokeShare: () => void;
  onClose: () => void;
};

const AnalysisShareModal: React.FC<Props> = ({
  isOpen, shareData, isCreating, isRevoking, error, copied,
  expiresInDays, onExpiresInDaysChange,
  onCreateShare, onCopyShare, onRevokeShare, onClose,
}) => {
  if (!isOpen) return null;

  const busy = isCreating || isRevoking;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="relative w-full max-w-md bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 id="share-modal-title" className="text-base font-bold text-white">Share Analysis</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/70 transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-white/50">
          Anyone with this private link can view a read-only version of this analysis.
        </p>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* No share yet */}
        {!shareData && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="expiry-select" className="text-xs font-semibold text-white/70">
                Link expiry
              </label>
              <select
                id="expiry-select"
                value={expiresInDays === null ? '' : expiresInDays}
                onChange={(e) => {
                  const val = e.target.value;
                  onExpiresInDaysChange(val === '' ? null : parseInt(val, 10));
                }}
                className="w-full bg-[#151822] border border-white/10 rounded-xl px-3 py-2 text-sm text-white/90 outline-none focus:border-indigo-500/50"
                disabled={busy}
              >
                <option value="">No expiry</option>
                <option value="1">1 day</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
              </select>
              <p className="text-[10px] text-white/40">
                Expired links stop working automatically.
              </p>
            </div>

          <button
            onClick={onCreateShare}
            disabled={busy}
            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating…' : 'Create Share Link'}
          </button>
          </div>
        )}

        {/* Share URL exists */}
        {shareData && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                readOnly
                value={shareData.share_url}
                className="flex-1 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 font-mono truncate outline-none"
              />
              <button
                onClick={onCopyShare}
                className="shrink-0 text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/20 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <p className="text-xs text-white/40">
              {shareData.expires_at ? `Expires: ${new Date(shareData.expires_at).toLocaleString()}` : 'No expiry'}
            </p>

            <button
              onClick={onRevokeShare}
              disabled={busy}
              className="w-full py-2 rounded-xl text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRevoking ? 'Revoking…' : 'Revoke Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisShareModal;
