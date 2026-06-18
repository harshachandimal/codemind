import React from 'react';
import type { Analysis } from '../../types/analysis';
import type { UserSettings } from '../../types/settings';
import { buildVisualExplanation } from '../../utils/visualizer';
import AnalyzerEmptyState from './AnalyzerEmptyState';
import AnalysisStaticNote from './AnalysisStaticNote';
import ComplexityLensPanel from '../visualizer/ComplexityLensPanel';
import RecursionStackPreview from '../visualizer/RecursionStackPreview';
import RuntimeTraceSummaryPanel from '../trace/RuntimeTraceSummaryPanel';
import { RuntimeTracePlayer } from '../trace-player/RuntimeTracePlayer';
import { getRuntimeTraceSteps } from '../../utils/getRuntimeTraceSteps';
import { TracePlayerStep } from '../../types/tracePlayer';
import RecursionTreePanel from '../trace/RecursionTreePanel';
import RecursionUnwindPanel from '../trace/RecursionUnwindPanel';
import AnalysisExportButtons from './AnalysisExportButtons';
import AnalysisShareButton from './AnalysisShareButton';

type Props = {
  analysis: Analysis | null;
  /** When true, hides owner-only actions (export, share). Use on the public shared page. */
  readOnly?: boolean;
  settings?: UserSettings;
};

const AnalysisResultPanel: React.FC<Props> = ({ analysis, readOnly = false, settings }) => {
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
        <div className="flex items-center gap-2">
          {isStubbed && (
            <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Stubbed Result
            </span>
          )}
          {!readOnly && (
            <>
              <AnalysisExportButtons analysis={analysis} />
              <AnalysisShareButton analysis={analysis} />
            </>
          )}
        </div>
      </div>

      {/* Complexity Lens — cards + detected pattern grid */}
      {settings?.show_visual_explanations !== false ? (
        <>
          <ComplexityLensPanel
            complexityItems={visualModel.complexityItems}
            patterns={visualModel.patterns}
          />
          {/* Recursion Stack Preview — only when recursion frames are present */}
          {visualModel.recursionFrames.length > 0 && (
            <RecursionStackPreview frames={visualModel.recursionFrames} />
          )}
        </>
      ) : (
        <div className="text-xs text-white/40 italic">Visual explanations are hidden in your settings.</div>
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


      {settings?.show_runtime_trace !== false ? (
        <>
          {/* Runtime Trace Summary */}
          <RuntimeTraceSummaryPanel analysis={analysis} />

          {!['unsupported_language', 'unsupported', 'not_available'].includes(analysis.trace_mode as string) && 
           !analysis.trace_error?.message.includes('JavaScript only') && (
            <>
              {/* Recursion Tree (renders only if recursive trace exists) */}
              <RecursionTreePanel analysis={analysis} />

              {/* Recursion Unwinding (renders only if recursive trace exists) */}
              <RecursionUnwindPanel analysis={analysis} />

              <RuntimeTracePlayer rawSteps={getRuntimeTraceSteps(analysis) as TracePlayerStep[]} language={analysis.language} />
            </>
          )}
        </>
      ) : (
        <div className="text-xs text-white/40 italic">Runtime trace is hidden in your settings.</div>
      )}

      <AnalysisStaticNote />
    </div>
  );
};

export default AnalysisResultPanel;

