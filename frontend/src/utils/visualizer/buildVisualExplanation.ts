import type { Analysis } from '../../types/analysis';
import type {
  VisualExplanationModel,
  ComplexityVisualItem,
} from '../../types/visualizer';
import { getComplexityTone, describeComplexity } from './complexityVisuals';
import { buildPatternVisuals } from './patternVisuals';
import { buildRecursionFrames } from './recursionVisuals';
import { buildLoopSteps } from './loopVisuals';

/**
 * Converts a backend Analysis object into a VisualExplanationModel.
 *
 * All produced data is derived from static analysis estimates provided by the
 * backend. No code is executed during this transformation and no runtime values
 * are inferred or fabricated.
 *
 * @param analysis - The Analysis object returned by the CodeMind backend.
 * @returns A VisualExplanationModel ready for consumption by visualizer components.
 */
export function buildVisualExplanation(analysis: Analysis): VisualExplanationModel {
  const timeValue = analysis.time_complexity ?? 'Unknown';
  const spaceValue = analysis.space_complexity ?? 'Unknown';

  const complexityItems: ComplexityVisualItem[] = [
    {
      label: 'Time Complexity',
      value: timeValue,
      description: describeComplexity('time', analysis.time_complexity),
      tone: getComplexityTone(analysis.time_complexity),
    },
    {
      label: 'Space Complexity',
      value: spaceValue,
      description: describeComplexity('space', analysis.space_complexity),
      tone: getComplexityTone(analysis.space_complexity),
    },
  ];

  return {
    complexityItems,
    patterns: buildPatternVisuals(analysis.detected_patterns),
    recursionFrames: buildRecursionFrames(analysis.detected_patterns),
    loopSteps: buildLoopSteps(analysis.detected_patterns),
  };
}
