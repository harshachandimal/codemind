import React from 'react';
import type { Analysis } from '../../../types/analysis';
import { getComplexityTone, describeComplexity } from '../../../utils/visualizer';
import ComplexityMetricCard from './ComplexityMetricCard';
import type { VisualizerTone } from '../../../types/visualizer';

// Map VisualizerTone -> ComplexityMetricCard variant (same names, typed explicitly)
const toneToVariant: Record<VisualizerTone, 'success' | 'accent' | 'warning' | 'danger' | 'neutral'> = {
  success: 'success',
  accent:  'accent',
  warning: 'warning',
  danger:  'danger',
  neutral: 'neutral',
};

type Props = { analysis: Analysis };

const StaticAnalysisOverview: React.FC<Props> = ({ analysis }) => {
  const timeTone   = getComplexityTone(analysis.time_complexity);
  const spaceTone  = getComplexityTone(analysis.space_complexity);

  return (
    <section aria-label="Complexity Overview">
      {/* Section heading */}
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">
          Complexity Overview
        </p>
        <p className="text-xs text-white/35 leading-relaxed">
          Estimated growth behaviour based on CodeMind's static analyser.
        </p>
      </div>

      {/* Two cards side-by-side on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ComplexityMetricCard
          label="Time Complexity"
          value={analysis.time_complexity}
          description={describeComplexity('time', analysis.time_complexity)}
          variant={toneToVariant[timeTone]}
        />
        <ComplexityMetricCard
          label="Space Complexity"
          value={analysis.space_complexity}
          description={describeComplexity('space', analysis.space_complexity)}
          variant={toneToVariant[spaceTone]}
        />
      </div>
    </section>
  );
};

export default StaticAnalysisOverview;
