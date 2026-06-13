import { TraceInterpreterError } from '../errors/TraceInterpreterError.js';
import { createInitialInterpreterState } from './createInitialInterpreterState.js';
import { StepRecorder } from './StepRecorder.js';
import { assertCallDepthAvailable } from './assertCallDepth.js';
import type { RuntimeValue, InterpreterState, CallFrame, VariableStore } from '../types/interpreter.js';
import type { FunctionDeclaration } from '@babel/types';

/**
 * InterpreterEnvironment — manages variable scope and call stack for
 * the future AST interpreter.
 *
 * Provides a clean interface for:
 * - Defining and updating variables in the current scope.
 * - Pushing and popping call frames on the call stack.
 *
 * SAFETY:
 * - This class does not execute code or evaluate expressions.
 * - All values must already be resolved RuntimeValues.
 * - Variables are stored on state.variables, which is snapshotted
 *   by StepRecorder before each TraceStep is emitted.
 */
export class InterpreterEnvironment {
  public readonly state: InterpreterState;
  public readonly recorder: StepRecorder;
  public readonly functionRegistry: Map<string, FunctionDeclaration> = new Map();

  public constructor() {
    this.state = createInitialInterpreterState();
    this.recorder = new StepRecorder(this.state, () => this.getCurrentVariables());
  }

  /**
   * Internal helper to return the active variable scope.
   * If inside a function frame, returns the frame's scope.
   * Otherwise returns the root state scope.
   */
  private getCurrentVariableStore(): VariableStore {
    const stackLen = this.state.callStack.length;
    if (stackLen > 0) {
      return this.state.callStack[stackLen - 1]!.variables;
    }
    return this.state.variables;
  }

  /**
   * Returns the current active variable scope (for snapshotting).
   */
  public getCurrentVariables(): VariableStore {
    return this.getCurrentVariableStore();
  }

  /**
   * Declares a new variable in the current scope with the given value.
   * If the variable already exists it is overwritten (var-like semantics for MVP).
   */
  public defineVariable(name: string, value: RuntimeValue): void {
    const store = this.getCurrentVariableStore();
    store[name] = value;
  }

  /**
   * Assigns a new value to an already-declared variable in the current scope.
   *
   * @throws {TraceInterpreterError} with code UNDEFINED_VARIABLE if
   *   the variable has not been declared.
   */
  public assignVariable(name: string, value: RuntimeValue): void {
    const store = this.getCurrentVariableStore();
    if (!(name in store)) {
      throw new TraceInterpreterError(
        `Assignment to undeclared variable "${name}".`,
        'UNDEFINED_VARIABLE',
      );
    }
    store[name] = value;
  }

  /**
   * Returns the current value of a declared variable in the current scope.
   *
   * @throws {TraceInterpreterError} with code UNDEFINED_VARIABLE if
   *   the variable has not been declared.
   */
  public getVariable(name: string): RuntimeValue {
    const store = this.getCurrentVariableStore();
    if (!(name in store)) {
      throw new TraceInterpreterError(
        `Reference to undeclared variable "${name}".`,
        'UNDEFINED_VARIABLE',
      );
    }
    return store[name]!;
  }

  // TODO: Future recursion implementation needs local variable scope per call frame.
  // Current environment helpers may need scope-aware variable lookup before recursion execution.

  /**
   * Pushes a new call frame onto the call stack and marks the interpreter running.
   */
  public pushFrame(frame: CallFrame): void {
    assertCallDepthAvailable(this.state);
    this.state.callStack.push(frame);
    this.state.status = 'running';
  }

  /**
   * Removes the most recent call frame from the stack.
   *
   * @throws {TraceInterpreterError} with code EMPTY_CALL_STACK if the
   *   stack is already empty.
   */
  public popFrame(): void {
    if (this.state.callStack.length === 0) {
      throw new TraceInterpreterError(
        'Attempted to pop a frame from an empty call stack.',
        'EMPTY_CALL_STACK',
      );
    }
    this.state.callStack.pop();
  }
}
