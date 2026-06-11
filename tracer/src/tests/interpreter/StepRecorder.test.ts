import { describe, it, expect } from 'vitest';
import { StepRecorder } from '../../interpreter/StepRecorder.js';
import { createInitialInterpreterState } from '../../interpreter/createInitialInterpreterState.js';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';
import { TRACE_LIMITS } from '../../config/traceLimits.js';

describe('StepRecorder', () => {
  it('records_trace_step_with_variable_snapshot', () => {
    const state = createInitialInterpreterState();
    state.variables = { total: 0 };

    const recorder = new StepRecorder(state);

    const step = recorder.record({
      line: 2,
      type: 'assignment',
      description: 'Assigned total = 0',
    });

    expect(step.step).toBe(1);
    expect(step.variables['total']).toBe(0);
    expect(recorder.getSteps()).toHaveLength(1);
  });

  it('snapshots_arrays_without_mutating_original', () => {
    const state = createInitialInterpreterState();
    const originalArr = [1, 2, 3];
    state.variables = { arr: originalArr };

    const recorder = new StepRecorder(state);
    recorder.record({
      line: 1,
      type: 'variable_declaration',
      description: 'Declared arr',
    });

    const recorded = recorder.getSteps()[0];
    expect(recorded?.variables['arr']).toEqual([1, 2, 3]);

    // Mutate the original — snapshot must not change
    originalArr.push(99);
    expect(recorded?.variables['arr']).toEqual([1, 2, 3]);
  });

  it('enforces_max_steps', () => {
    const state = createInitialInterpreterState();
    const recorder = new StepRecorder(state);

    // Exhaust the step budget
    for (let i = 0; i < TRACE_LIMITS.maxSteps; i++) {
      recorder.record({ line: null, type: 'assignment', description: `step ${i}` });
    }

    // One more must throw
    expect(() =>
      recorder.record({ line: null, type: 'assignment', description: 'overflow' }),
    ).toThrow(TraceInterpreterError);

    expect(state.status).toBe('max_steps');
  });
});
