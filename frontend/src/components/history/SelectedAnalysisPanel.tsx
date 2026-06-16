import React from 'react';
import { Link } from 'react-router-dom';
import { Analysis } from '../../types/analysis';
import Panel from '../common/Panel';
import DeleteAnalysisButton from './DeleteAnalysisButton';
import StaticAnalysisView from '../analysis-result/StaticAnalysisView';
import AnalysisExportButtons from '../analyzer/AnalysisExportButtons';
import AnalysisShareButton from '../analyzer/AnalysisShareButton';

type Props = {
  analysis: Analysis | null;
  deleting: boolean;
  onDelete: () => void;
  onAnalysisUpdated?: (analysis: Analysis) => void;
};

const SelectedAnalysisPanel: React.FC<Props> = ({ 
  analysis, 
  deleting, 
  onDelete,
}) => {

  if (!analysis) {
    return (
      <Panel className="p-10 flex items-center justify-center text-center h-full min-h-[400px]">
        <p className="text-sm text-white/40">Select an analysis to inspect its report.</p>
      </Panel>
    );
  }

  const isTraceAvailable = !['unsupported_language', 'unsupported', 'not_available'].includes(analysis.trace_mode as string) || analysis.language === 'javascript' || analysis.language === 'python' || analysis.language === 'java';

  return (
    <Panel className="p-6 h-full flex flex-col gap-6 relative overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">{analysis.title || 'Untitled analysis'}</h2>
          <p className="text-sm text-white/40">
            Status: <span className="text-indigo-400 capitalize">{analysis.status}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isTraceAvailable ? (
            <Link
              to={`/history/${analysis.id}/runtime-trace`}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Open Runtime Trace
            </Link>
          ) : (
            <button
              disabled
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-500 rounded-lg cursor-not-allowed"
              title="Runtime trace is not supported for this language."
            >
              Runtime Trace Unavailable
            </button>
          )}

          <AnalysisExportButtons analysis={analysis} />
          <AnalysisShareButton analysis={analysis} />
          <DeleteAnalysisButton loading={deleting} onDelete={onDelete} />
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6">
        <StaticAnalysisView analysis={analysis} />
      </div>
    </Panel>
  );
};

export default SelectedAnalysisPanel;
