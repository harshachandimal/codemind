import type { PatternVisualItem, VisualizerTone } from '../../types/visualizer';
import { toTitleCaseFromSnakeCase } from './textFormatters';

/** Lookup table for known pattern keys. */
export const KNOWN_PATTERN_MAP: Record<
  string,
  { label: string; description: string; tone: VisualizerTone }
> = {
  constant_operations: {
    label: 'Constant Operations',
    description:
      'No loop or recursive growth was detected, so the code is estimated as constant complexity.',
    tone: 'success',
  },
  single_loop: {
    label: 'Single Loop',
    description:
      'A loop was detected that may grow linearly with input size.',
    tone: 'accent',
  },
  nested_loop: {
    label: 'Nested Loop',
    description:
      'A loop appears inside another loop, which often leads to quadratic growth.',
    tone: 'warning',
  },
  logarithmic_loop: {
    label: 'Logarithmic Loop',
    description:
      'The code appears to repeatedly reduce the input size, such as dividing by 2.',
    tone: 'success',
  },
  recursion: {
    label: 'Recursion',
    description: 'The function appears to call itself.',
    tone: 'accent',
  },
  base_case: {
    label: 'Base Case',
    description: 'A conditional branch appears to stop the recursion.',
    tone: 'success',
  },
  call_stack_growth: {
    label: 'Call Stack Growth',
    description:
      'Recursive calls may remain on the call stack until the base case returns.',
    tone: 'warning',
  },
};

/**
 * Converts the backend detected_patterns string array into PatternVisualItem[].
 * Unknown patterns are gracefully handled with a fallback shape.
 */
export function buildPatternVisuals(
  patterns: string[] | null
): PatternVisualItem[] {
  if (!patterns || patterns.length === 0) return [];

  return patterns.map((key) => {
    const known = KNOWN_PATTERN_MAP[key];
    if (known) {
      return { key, ...known };
    }
    // Graceful fallback for any pattern CodeMind adds in the future.
    return {
      key,
      label: toTitleCaseFromSnakeCase(key),
      description: 'Pattern detected by CodeMind.',
      tone: 'neutral' as VisualizerTone,
    };
  });
}
