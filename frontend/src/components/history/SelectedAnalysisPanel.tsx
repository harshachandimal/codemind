import React from 'react';
import { Analysis } from '../../types/analysis';
import Panel from '../common/Panel';
import ComplexityMetric from '../analyzer/ComplexityMetric';
import PatternBadgeList from '../analyzer/PatternBadgeList';
import DeleteAnalysisButton from './DeleteAnalysisButton';
import RuntimeTraceSummaryPanel from '../trace/RuntimeTraceSummaryPanel';
import { RuntimeTracePlayer } from '../trace-player/RuntimeTracePlayer';
import AnalysisExportButtons from '../analyzer/AnalysisExportButtons';
import AnalysisShareButton from '../analyzer/AnalysisShareButton';

type Props = {
  analysis: Analysis | null;
  deleting: boolean;
  onDelete: () => void;
};

const SelectedAnalysisPanel: React.FC<Props> = ({ analysis, deleting, onDelete }) => {
  if (!analysis) {
    return (
      <Panel className="p-10 flex items-center justify-center text-center h-full min-h-[400px]">
        <p className="text-sm text-white/40">Select an analysis to inspect its report.</p>
      </Panel>
    );
  }

  return (
    <Panel className="p-6 h-full flex flex-col gap-6 relative overflow-y-auto custom-scrollbar">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">{analysis.title || 'Untitled analysis'}</h2>
          <p className="text-sm text-white/40">Status: <span className="text-indigo-400 capitalize">{analysis.status}</span></p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AnalysisExportButtons analysis={analysis} />
          <AnalysisShareButton analysis={analysis} />
          <DeleteAnalysisButton loading={deleting} onDelete={onDelete} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ComplexityMetric label="Time Complexity" value={analysis.time_complexity} />
        <ComplexityMetric label="Space Complexity" value={analysis.space_complexity} />
      </div>

      <div>
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">Detected Patterns</h3>
        <PatternBadgeList patterns={analysis.detected_patterns} />
      </div>

      {analysis.explanation && (
        <div>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Explanation</h3>
          <div className="text-sm text-white/60 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
            {analysis.explanation}
          </div>
        </div>
      )}

      <RuntimeTraceSummaryPanel analysis={analysis} />

      <RuntimeTracePlayer rawSteps={analysis.trace_steps} language={analysis.language} />

      <div>
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Source Code Snippet</h3>
        <pre className="text-xs text-gray-300 font-mono bg-[#0d1117] p-4 rounded-xl border border-white/5 overflow-x-auto">
          <code>{analysis.source_code}</code>
        </pre>
      </div>
    </Panel>
  );
};

export default SelectedAnalysisPanel;
