import { TRACE_LIMITS } from '../config/traceLimits.js';
import { TraceInterpreterError } from '../errors/TraceInterpreterError.js';
import type { InterpreterState } from '../types/interpreter.js';

/**
 * Throws a TraceInterpreterError if the current loop nesting depth has
 * reached the configured maximum. Sets state.status to 'error' before
 * throwing so the environment is left in a safe, terminated state.
 *
 * Call this BEFORE incrementing loopDepth, i.e. before entering a new loop.
 */
export function assertLoopDepthAvailable(state: InterpreterState): void {
  if (state.loopDepth >= TRACE_LIMITS.maxLoopDepth) {
    state.status = 'error';
    throw new TraceInterpreterError(
      'Maximum loop nesting depth exceeded.',
      'MAX_LOOP_DEPTH_EXCEEDED',
    );
  }
}
