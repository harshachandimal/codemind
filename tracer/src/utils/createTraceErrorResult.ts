/**
 * createTraceErrorResult — builds a safe, structured TraceResult for
 * error conditions without exposing stack traces or internal state.
 *
 * Use this instead of returning raw Error objects from TraceService so
 * that callers always receive a well-typed, predictable payload.
 *
 * SAFETY: Never include raw Error.stack, sourceCode, or system paths
 * in the description argument. Keep descriptions user-facing and brief.
 */

import type { TraceResult } from '../types/trace';

/**
 * Returns a failed TraceResult containing a single error step.
 *
 * @param description - Short, safe user-facing message describing the error.
 * @param terminatedReason - Why the trace was terminated. Defaults to 'error'.
 */
export function createTraceErrorResult(
  description: string,
  terminatedReason: 'timeout' | 'max_steps' | 'error' = 'error',
): TraceResult {
  return {
    success: false,
    steps: [
      {
        step: 1,
        line: null,
        type: 'error',
        description,
        variables: {},
        callStack: [],
      },
    ],
    summary: {
      totalSteps: 1,
      terminatedReason,
    },
  };
}
