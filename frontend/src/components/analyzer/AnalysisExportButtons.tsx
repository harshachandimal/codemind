import React, { useState } from 'react';
import type { Analysis, AnalysisExportFormat, AnalysisExportData } from '../../types/analysis';
import { exportAnalysis } from '../../services/analysisService';
import { downloadTextFile } from '../../utils/downloadTextFile';
import AnalysisExportPreviewModal from './AnalysisExportPreviewModal';

type Props = {
  analysis: Analysis;
};

const AnalysisExportButtons: React.FC<Props> = ({ analysis }) => {
  const [loadingFormat, setLoadingFormat] = useState<AnalysisExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewExportData, setPreviewExportData] = useState<AnalysisExportData | null>(null);

  const handleExport = async (format: AnalysisExportFormat) => {
    setLoadingFormat(format);
    setError(null);

    try {
      const data = await exportAnalysis(analysis.id, format);
      setPreviewExportData(data);
    } catch {
      setError('Export preview failed. Please try again.');
    } finally {
      setLoadingFormat(null);
    }
  };

  const handleDownload = (exportData: AnalysisExportData) => {
    downloadTextFile({
      filename: exportData.filename,
      content: exportData.content,
      mimeType: exportData.mime_type,
    });
    setPreviewExportData(null);
  };

  const handleCloseModal = () => setPreviewExportData(null);

  const isLoading = loadingFormat !== null;

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ExportButton
            label="Export Markdown"
            loading={loadingFormat === 'markdown'}
            disabled={isLoading}
            onClick={() => handleExport('markdown')}
            colorClass="text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20"
          />
          <ExportButton
            label="Export JSON"
            loading={loadingFormat === 'json'}
            disabled={isLoading}
            onClick={() => handleExport('json')}
            colorClass="text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400/90 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">
            {error}
          </p>
        )}
      </div>

      <AnalysisExportPreviewModal
        exportData={previewExportData}
        isOpen={previewExportData !== null}
        onClose={handleCloseModal}
        onDownload={handleDownload}
      />
    </>
  );
};

// ---------------------------------------------------------------------------
// Small sub-component kept inline to avoid extra file overhead
// ---------------------------------------------------------------------------

type ExportButtonProps = {
  label: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  colorClass: string;
};

const ExportButton: React.FC<ExportButtonProps> = ({
  label,
  loading,
  disabled,
  onClick,
  colorClass,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={[
      'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      colorClass,
    ].join(' ')}
  >
    {loading ? 'Loading…' : label}
  </button>
);

export default AnalysisExportButtons;
