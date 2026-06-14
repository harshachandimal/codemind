import { describe, it, expect } from 'vitest';
import { createInitialInterpreterState } from '../../interpreter/createInitialInterpreterState.js';

describe('createInitialInterpreterState', () => {
  it('returns_a_clean_idle_state', () => {
    const state = createInitialInterpreterState();

    expect(state.status).toBe('idle');
    expect(state.stepCount).toBe(0);
    expect(state.variables).toEqual({});
    expect(state.callStack).toEqual([]);
    expect(state.returnedValue).toBeUndefined();
    expect(state.loopDepth).toBe(0);
  });
});
