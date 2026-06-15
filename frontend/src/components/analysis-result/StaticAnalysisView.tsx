import React from 'react';
import type { Analysis } from '../../types/analysis';
import type { UserSettings } from '../../types/settings';
import { buildVisualExplanation } from '../../utils/visualizer';
import ComplexityLensPanel from '../visualizer/ComplexityLensPanel';
import RecursionStackPreview from '../visualizer/RecursionStackPreview';
import AnalysisStaticNote from '../analyzer/AnalysisStaticNote';

type Props = {
  analysis: Analysis;
  settings?: UserSettings;
};

const StaticAnalysisView: React.FC<Props> = ({ analysis, settings }) => {
  const visualModel = buildVisualExplanation(analysis);

  return (
    <div className="flex flex-col gap-5">
      {settings?.show_visual_explanations !== false ? (
        <>
          <ComplexityLensPanel
            complexityItems={visualModel.complexityItems}
            patterns={visualModel.patterns}
          />
          {visualModel.recursionFrames.length > 0 && (
            <RecursionStackPreview frames={visualModel.recursionFrames} />
          )}
        </>
      ) : (
        <div className="text-xs text-white/40 italic">Visual explanations are hidden in your settings.</div>
      )}

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

      <AnalysisStaticNote />
    </div>
  );
};

export default StaticAnalysisView;
