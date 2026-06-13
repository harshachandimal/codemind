import { describe, it, expect } from 'vitest';
import { InterpreterEnvironment } from '../../interpreter/InterpreterEnvironment.js';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';

describe('InterpreterEnvironment', () => {
  it('defines_variables_in_root_scope_when_no_frame', () => {
    const env = new InterpreterEnvironment();
    env.defineVariable('x', 1);
    expect(env.getVariable('x')).toBe(1);
    expect(env.state.variables.x).toBe(1);
  });

  it('defines_variables_in_current_call_frame', () => {
    const env = new InterpreterEnvironment();
    env.pushFrame({ functionName: 'test', variables: {}, line: 1 });
    env.defineVariable('x', 10);
    
    expect(env.getVariable('x')).toBe(10);
    expect(env.state.variables.x).toBeUndefined();
    expect(env.state.callStack[0]?.variables.x).toBe(10);
  });

  it('isolates_variables_between_frames', () => {
    const env = new InterpreterEnvironment();
    
    env.pushFrame({ functionName: 'outer', variables: {}, line: 1 });
    env.defineVariable('x', 1);
    
    env.pushFrame({ functionName: 'inner', variables: {}, line: 2 });
    env.defineVariable('x', 2);
    
    expect(env.getVariable('x')).toBe(2);
    env.popFrame();
    expect(env.getVariable('x')).toBe(1);
  });

  it('assignment_updates_current_frame_only', () => {
    const env = new InterpreterEnvironment();
    env.pushFrame({ functionName: 'test', variables: {}, line: 1 });
    env.defineVariable('total', 0);
    env.assignVariable('total', 5);
    
    expect(env.state.callStack[0]?.variables.total).toBe(5);
    expect(env.state.variables.total).toBeUndefined();
  });

  it('throws_for_missing_variable_in_current_scope', () => {
    const env = new InterpreterEnvironment();
    env.pushFrame({ functionName: 'test', variables: {}, line: 1 });
    
    expect(() => env.getVariable('missing')).toThrow(TraceInterpreterError);
  });

  it('push_and_pop_call_frame', () => {
    const env = new InterpreterEnvironment();

    env.pushFrame({ functionName: 'sum', variables: {}, line: 1 });
    expect(env.state.callStack).toHaveLength(1);
    expect(env.state.callStack[0]?.functionName).toBe('sum');

    env.popFrame();
    expect(env.state.callStack).toHaveLength(0);
  });

  it('throws_when_popping_empty_stack', () => {
    const env = new InterpreterEnvironment();

    expect(() => env.popFrame()).toThrow(TraceInterpreterError);
  });

  it('pushFrame_enforces_max_call_depth', () => {
    const env = new InterpreterEnvironment();
    // push 20 frames, then the 21st will throw.
    for (let i = 0; i < 20; i++) {
      env.pushFrame({ functionName: `func_${i}`, variables: {}, line: 1 });
    }

    let error: any;
    try {
      env.pushFrame({ functionName: 'func_20', variables: {}, line: 1 });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(TraceInterpreterError);
    expect(error.code).toBe('MAX_CALL_DEPTH_EXCEEDED');
  });
});
