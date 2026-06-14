import React from 'react';
import type { AnalysisExportData } from '../../types/analysis';

const PREVIEW_LIMIT = 12000;

type AnalysisExportPreviewModalProps = {
  exportData: AnalysisExportData | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (exportData: AnalysisExportData) => void;
};

const AnalysisExportPreviewModal: React.FC<AnalysisExportPreviewModalProps> = ({
  exportData,
  isOpen,
  onClose,
  onDownload,
}) => {
  if (!isOpen || !exportData) return null;

  const isTruncated = exportData.content.length > PREVIEW_LIMIT;
  const previewContent = isTruncated
    ? exportData.content.slice(0, PREVIEW_LIMIT)
    : exportData.content;

  const displayContent =
    exportData.format === 'json'
      ? (() => {
          try {
            return JSON.stringify(JSON.parse(previewContent), null, 2);
          } catch {
            return previewContent;
          }
        })()
      : previewContent;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Export Preview</h2>
            <div className="flex flex-wrap gap-3 text-xs text-white/50">
              <span><span className="text-white/30">File:</span> <span className="text-white/70 font-mono">{exportData.filename}</span></span>
              <span><span className="text-white/30">Format:</span> <span className="uppercase text-indigo-400">{exportData.format}</span></span>
              <span><span className="text-white/30">MIME:</span> <span className="font-mono text-white/50">{exportData.mime_type}</span></span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Content preview */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">Content</span>
          <pre className="bg-black/40 border border-white/5 rounded-xl p-4 text-sm font-mono text-gray-300 overflow-x-auto overflow-y-auto max-h-[45vh] whitespace-pre-wrap break-words">
            {displayContent}
          </pre>
          {isTruncated && (
            <p className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
              Preview truncated. Download the file to view the full export.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onDownload(exportData)}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisExportPreviewModal;
