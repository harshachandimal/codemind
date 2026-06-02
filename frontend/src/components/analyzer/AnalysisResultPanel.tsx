import React from 'react';
import { Analysis } from '../../types/analysis';
import Panel from '../common/Panel';
import ComplexityMetric from './ComplexityMetric';
import PatternBadgeList from './PatternBadgeList';
import AnalyzerEmptyState from './AnalyzerEmptyState';

type Props = {
  analysis: Analysis | null;
};

const AnalysisResultPanel: React.FC<Props> = ({ analysis }) => {
  if (!analysis) return <AnalyzerEmptyState />;

  const isStubbed = analysis.detected_patterns?.includes('stubbed_analysis');

  return (
    <Panel className="p-6 h-full flex flex-col gap-6 relative overflow-hidden">
      {isStubbed && (
        <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-500 text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg border-b border-l border-amber-500/20">
          Stubbed Result
        </div>
      )}
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Analysis Report</h2>
        <p className="text-sm text-white/40">Status: <span className="text-indigo-400 capitalize">{analysis.status}</span></p>
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
    </Panel>
  );
};

export default AnalysisResultPanel;
