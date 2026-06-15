import type { LoopPreviewStep } from '../../../types/visualizer';

/**
 * Returns conceptual loop explanation steps based on the detected loop pattern.
 *
 * IMPORTANT: These steps describe general loop behaviour — they are not a log
 * of real iteration values from executing the code.
 */
export function buildLoopSteps(patterns: string[] | null): LoopPreviewStep[] {
  if (!patterns) return [];

  if (patterns.includes('nested_loop')) {
    const isTriple = patterns.includes('loop_depth_3');
    const depthLabel = isTriple ? 'three' : 'two';
    const complexityLabel = isTriple ? 'O(n³)' : 'O(n²)';

    return [
      {
        id: 'loop-step-1',
        label: 'Outer Loop Begins',
        description: `The outer loop starts iterating over the input. The analyzer detected loops nested ${depthLabel} levels deep.`,
      },
      {
        id: 'loop-step-2',
        label: 'Inner Loop Runs',
        description:
          'For each step of the outer loop, the inner loop may process the entire input again — multiplying the total work.',
      },
      {
        id: 'loop-step-3',
        label: `${isTriple ? 'Cubic' : 'Quadratic'} Growth (${complexityLabel})`,
        description: `Total work grows as n raised to the power ${depthLabel === 'two' ? '2' : '3'}. Doubling the input size ${isTriple ? 'multiplies work by eight' : 'multiplies work by four'}.`,
      },
    ];
  }

  if (patterns.includes('logarithmic_loop')) {
    return [
      {
        id: 'loop-step-1',
        label: 'Loop Starts with n',
        description:
          'The loop begins with an input size of n and tracks a variable that changes each iteration.',
      },
      {
        id: 'loop-step-2',
        label: 'Input Halved Each Step',
        description:
          'Each iteration significantly reduces the remaining range — often by dividing by 2.',
      },
      {
        id: 'loop-step-3',
        label: 'Logarithmic Iterations',
        description:
          'Because the range shrinks rapidly, the total number of iterations grows only as log₂(n).',
      },
    ];
  }

  if (patterns.includes('single_loop')) {
    return [
      {
        id: 'loop-step-1',
        label: 'Loop Starts',
        description:
          'The loop begins and prepares to process the input one element at a time.',
      },
      {
        id: 'loop-step-2',
        label: 'Each Iteration Processes Input',
        description:
          'Each step of the loop handles a portion of the input — work grows linearly.',
      },
      {
        id: 'loop-step-3',
        label: 'Loop Ends',
        description:
          'The loop finishes after all input elements have been processed.',
      },
    ];
  }

  return [];
}
