import { describe, it, expect } from 'vitest';
import { assertCallDepthAvailable } from '../../interpreter/assertCallDepth.js';
import { createInitialInterpreterState } from '../../interpreter/createInitialInterpreterState.js';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import { TRACE_LIMITS } from '../../config/traceLimits.js';
import type { CallFrame } from '../../types/interpreter.js';

describe('assertCallDepthAvailable', () => {
  it('allows_when_call_stack_below_limit', () => {
    const state = createInitialInterpreterState();
    
    // push fewer than maxCallDepth fake frames
    for (let i = 0; i < TRACE_LIMITS.maxCallDepth - 1; i++) {
      state.callStack.push({ functionName: `func_${i}`, variables: {}, line: 1 });
    }

    expect(() => assertCallDepthAvailable(state)).not.toThrow();
    expect(state.status).not.toBe('error');
  });

  it('throws_when_call_stack_at_limit', () => {
    const state = createInitialInterpreterState();

    // fill callStack with maxCallDepth frames
    for (let i = 0; i < TRACE_LIMITS.maxCallDepth; i++) {
      state.callStack.push({ functionName: `func_${i}`, variables: {}, line: 1 });
    }

    let error: any;
    try {
      assertCallDepthAvailable(state);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(TraceInterpreterError);
    expect(error.code).toBe('MAX_CALL_DEPTH_EXCEEDED');
    expect(state.status).toBe('error');
  });
});
