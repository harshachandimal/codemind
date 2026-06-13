import { TRACE_LIMITS } from '../config/traceLimits.js';
import { TraceInterpreterError } from '../errors/TraceInterpreterError.js';
import type { InterpreterState } from '../types/interpreter.js';

export function assertCallDepthAvailable(state: InterpreterState): void {
  if (state.callStack.length >= TRACE_LIMITS.maxCallDepth) {
    state.status = 'error';
    throw new TraceInterpreterError(
      'Maximum call depth exceeded.',
      'MAX_CALL_DEPTH_EXCEEDED',
    );
  }
}
