import { describe, it, expect } from 'vitest';
import { InterpreterEnvironment } from '../../interpreter/InterpreterEnvironment.js';
import { TraceInterpreterError } from '../../errors/TraceInterpreterError.js';

describe('InterpreterEnvironment', () => {
  it('defines_and_gets_variable', () => {
    const env = new InterpreterEnvironment();

    env.defineVariable('total', 0);

    expect(env.getVariable('total')).toBe(0);
  });

  it('assigns_existing_variable', () => {
    const env = new InterpreterEnvironment();

    env.defineVariable('total', 0);
    env.assignVariable('total', 5);

    expect(env.getVariable('total')).toBe(5);
  });

  it('throws_for_undefined_assignment', () => {
    const env = new InterpreterEnvironment();

    expect(() => env.assignVariable('missing', 1)).toThrow(TraceInterpreterError);
  });

  it('throws_for_undefined_get', () => {
    const env = new InterpreterEnvironment();

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
});
