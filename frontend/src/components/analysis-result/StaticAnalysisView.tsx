import React from 'react';
import type { Analysis } from '../../types/analysis';
import type { UserSettings } from '../../types/settings';
import { buildPatternVisuals } from '../../utils/visualizer';
import { buildRecursionFrames } from '../../utils/visualizer';
import StaticAnalysisOverview from './static/StaticAnalysisOverview';
import PatternInsightsPanel from './static/PatternInsightsPanel';
import StaticExplanationPanel from './static/StaticExplanationPanel';
import StaticDiagnosticsPanel from './static/StaticDiagnosticsPanel';
import RecursionStackPreview from '../visualizer/RecursionStackPreview';

type Props = {
  analysis: Analysis;
  settings?: UserSettings;
};

const StaticAnalysisView: React.FC<Props> = ({ analysis, settings }) => {
  const patterns       = buildPatternVisuals(analysis.detected_patterns);
  const recursionFrames = buildRecursionFrames(analysis.detected_patterns);
  const showVisuals    = settings?.show_visual_explanations !== false;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">

      {/* A) Complexity Overview — two cards */}
      <StaticAnalysisOverview analysis={analysis} />

      {/*
        B/C/D) Main content grid:
        Desktop xl+: explanation takes the left column,
                     patterns + diagnostics stack in the right sidebar.
        Mobile:      everything stacks vertically.
      */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

        {/* Left: Explanation */}
        <StaticExplanationPanel explanation={analysis.explanation} />

        {/* Right sidebar: Patterns + Diagnostics */}
        <div className="flex flex-col gap-6">
          <PatternInsightsPanel patterns={patterns} />
          <StaticDiagnosticsPanel analysis={analysis} />
        </div>
      </div>

      {/* E) Optional static visuals — only when data exists and user hasn't hidden them */}
      {showVisuals && recursionFrames.length > 0 && (
        <RecursionStackPreview frames={recursionFrames} />
      )}

      {!showVisuals && (
        <p className="text-xs text-white/30 italic">
          Visual explanations are hidden in your settings.
        </p>
      )}
    </div>
  );
};

export default StaticAnalysisView;
