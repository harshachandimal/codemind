import type { RecursionStackFrame } from '../../types/visualizer';

/**
 * Returns a static conceptual recursion stack preview when recursion is detected.
 *
 * IMPORTANT: These frames are illustrative only. They do not reflect actual
 * runtime call values, argument states, or return values. They exist to help
 * the reader understand what a recursive call stack looks like conceptually.
 */
export function buildRecursionFrames(patterns: string[] | null): RecursionStackFrame[] {
  if (!patterns?.includes('recursion')) return [];

  return [
    {
      id: 'frame-1',
      depth: 1,
      label: 'recursiveCall(n)',
      description: 'Initial recursive call enters the stack.',
      state: 'active',
    },
    {
      id: 'frame-2',
      depth: 2,
      label: 'recursiveCall(n - 1)',
      description: 'Another call waits for the deeper call to finish.',
      state: 'waiting',
    },
    {
      id: 'frame-3',
      depth: 3,
      label: 'base case',
      description: 'The base case stops the recursion.',
      state: 'base-case',
    },
    {
      id: 'frame-4',
      depth: 2,
      label: 'unwind',
      description: 'Return values move back up the call stack.',
      state: 'unwinding',
    },
  ];
}
