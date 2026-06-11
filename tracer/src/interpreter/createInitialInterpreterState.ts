import type { InterpreterState } from '../types/interpreter.js';

/**
 * Creates a safe initial state for the runtime AST interpreter.
 * Does not execute any code.
 */
export function createInitialInterpreterState(): InterpreterState {
  return {
    status: 'idle',
    stepCount: 0,
    variables: {},
    callStack: [],
    returnedValue: undefined,
  };
}
