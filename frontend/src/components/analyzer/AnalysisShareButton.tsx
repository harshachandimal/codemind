import React, { useState, useCallback } from 'react';
import type { Analysis, AnalysisShareData } from '../../types/analysis';
import { createAnalysisShare, revokeAnalysisShare } from '../../services/analysisService';
import { copyToClipboard } from '../../utils/copyToClipboard';
import AnalysisShareModal from './AnalysisShareModal';

type Props = {
  analysis: Analysis;
};

const AnalysisShareButton: React.FC<Props> = ({ analysis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareData, setShareData] = useState<AnalysisShareData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setError(null);
    setCopied(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
    setCopied(false);
  };

  const handleCreateShare = useCallback(async () => {
    setIsCreating(true);
    setError(null);
    try {
      const data = await createAnalysisShare(analysis.id, expiresInDays ?? undefined);
      setShareData(data);
    } catch {
      setError('Failed to create share link. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [analysis.id, expiresInDays]);

  const handleCopyShare = useCallback(async () => {
    if (!shareData) return;
    const success = await copyToClipboard(shareData.share_url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setError('Could not copy to clipboard. Please copy the link manually.');
    }
  }, [shareData]);

  const handleRevokeShare = useCallback(async () => {
    setIsRevoking(true);
    setError(null);
    try {
      await revokeAnalysisShare(analysis.id);
      setShareData(null);
    } catch {
      setError('Failed to revoke share link. Please try again.');
    } finally {
      setIsRevoking(false);
    }
  }, [analysis.id]);

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20"
      >
        Share
      </button>

      <AnalysisShareModal
        isOpen={isOpen}
        shareData={shareData}
        isCreating={isCreating}
        isRevoking={isRevoking}
        error={error}
        copied={copied}
        expiresInDays={expiresInDays}
        onExpiresInDaysChange={setExpiresInDays}
        onCreateShare={handleCreateShare}
        onCopyShare={handleCopyShare}
        onRevokeShare={handleRevokeShare}
        onClose={handleClose}
      />
    </>
  );
};

export default AnalysisShareButton;
