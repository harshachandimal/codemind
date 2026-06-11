import type { TraceStep, TraceSummary } from './trace.js';

/**
 * Allowed primitive values in the first interpreter MVP.
 */
export type RuntimePrimitive = number | string | boolean | null;

/**
 * Allows primitive values and arrays of runtime values.
 * Arbitrary objects are not supported in the MVP.
 */
export type RuntimeValue = RuntimePrimitive | RuntimeValue[];

/**
 * Tracks current variable names and values.
 */
export type VariableStore = Record<string, RuntimeValue>;

/**
 * Represents one function call frame.
 */
export type CallFrame = {
  functionName: string;
  variables: VariableStore;
  line: number | null;
};

/**
 * Represents interpreter execution state.
 */
export type InterpreterStatus =
  | 'idle'
  | 'running'
  | 'returned'
  | 'completed'
  | 'error'
  | 'timeout'
  | 'max_steps';

/**
 * Internal execution state for the future interpreter.
 */
export type InterpreterState = {
  status: InterpreterStatus;
  stepCount: number;
  variables: VariableStore;
  callStack: CallFrame[];
  returnedValue: RuntimeValue | undefined;
};

/**
 * Runtime safety limits passed into the interpreter.
 */
export type InterpreterOptions = {
  maxSteps: number;
  maxLoopIterations: number;
  maxCallDepth: number;
  timeoutMs: number;
};

/**
 * Structured result from the future interpreter.
 */
export type InterpreterResult = {
  success: boolean;
  steps: TraceStep[];
  finalState: InterpreterState;
  terminatedReason: TraceSummary['terminatedReason'];
};
