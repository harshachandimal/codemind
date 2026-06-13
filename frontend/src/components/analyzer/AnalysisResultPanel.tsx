import React from 'react';
import type { Analysis } from '../../types/analysis';
import { buildVisualExplanation } from '../../utils/visualizer';
import AnalyzerEmptyState from './AnalyzerEmptyState';
import AnalysisStaticNote from './AnalysisStaticNote';
import ComplexityLensPanel from '../visualizer/ComplexityLensPanel';
import RecursionStackPreview from '../visualizer/RecursionStackPreview';
import RuntimeTraceSummaryPanel from '../trace/RuntimeTraceSummaryPanel';
import RuntimeTraceTimeline from '../trace/RuntimeTraceTimeline';
import RecursionTreePanel from '../trace/RecursionTreePanel';
import RecursionUnwindPanel from '../trace/RecursionUnwindPanel';

type Props = { analysis: Analysis | null };

const AnalysisResultPanel: React.FC<Props> = ({ analysis }) => {
  if (!analysis) return <AnalyzerEmptyState />;

  const visualModel = buildVisualExplanation(analysis);
  const isStubbed = analysis.detected_patterns?.includes('stubbed_analysis');

  return (
    <div className="flex flex-col gap-5">
      {/* Report header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Analysis Report</h2>
          <p className="text-sm text-white/40">
            Status: <span className="text-indigo-400 capitalize">{analysis.status}</span>
          </p>
        </div>
        {isStubbed && (
          <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Stubbed Result
          </span>
        )}
      </div>

      {/* Complexity Lens — cards + detected pattern grid */}
      <ComplexityLensPanel
        complexityItems={visualModel.complexityItems}
        patterns={visualModel.patterns}
      />

      {/* Recursion Stack Preview — only when recursion frames are present */}
      {visualModel.recursionFrames.length > 0 && (
        <RecursionStackPreview frames={visualModel.recursionFrames} />
      )}

      {/* Backend explanation text — preserved as additional context */}
      {analysis.explanation && (
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30">
            Explanation
          </p>
          <div className="text-sm text-white/60 leading-relaxed bg-white/[0.03] px-4 py-3 rounded-xl border border-white/[0.06]">
            {analysis.explanation}
          </div>
        </div>
      )}


      {/* Runtime Trace Summary */}
      <RuntimeTraceSummaryPanel analysis={analysis} />

      {/* Recursion Tree (renders only if recursive trace exists) */}
      <RecursionTreePanel analysis={analysis} />

      {/* Recursion Unwinding (renders only if recursive trace exists) */}
      <RecursionUnwindPanel analysis={analysis} />

      {/* Step-by-step execution timeline */}
      <RuntimeTraceTimeline analysis={analysis} />

      <AnalysisStaticNote />
    </div>
  );
};

export default AnalysisResultPanel;
