import { TRACE_LIMITS } from '../config/traceLimits.js';
import { TraceInterpreterError } from '../errors/TraceInterpreterError.js';
import { snapshotVariables } from './snapshotVariables.js';
import type { TraceStep, TraceStepType } from '../types/trace.js';
import type { InterpreterState } from '../types/interpreter.js';

/**
 * StepRecorder — records TraceStep entries during a future interpreter run.
 *
 * Responsibilities:
 * - Enforce the TRACE_LIMITS.maxSteps hard cap.
 * - Snapshot the current variable store at the moment of recording.
 * - Snapshot the current call stack function names.
 * - Store completed steps for retrieval by the interpreter.
 *
 * SAFETY: StepRecorder does not execute code. It only reads and copies
 * state that is already present in the shared InterpreterState.
 */
export class StepRecorder {
  private readonly steps: TraceStep[] = [];

  public constructor(private readonly state: InterpreterState) {}

  /**
   * Records a single trace step.
   *
   * @throws {TraceInterpreterError} with code MAX_STEPS_EXCEEDED when
   *   the step count has reached TRACE_LIMITS.maxSteps.
   */
  public record(params: {
    line: number | null;
    type: TraceStepType;
    description: string;
  }): TraceStep {
    if (this.state.stepCount >= TRACE_LIMITS.maxSteps) {
      this.state.status = 'max_steps';
      throw new TraceInterpreterError(
        `Trace exceeded the maximum step limit of ${TRACE_LIMITS.maxSteps}.`,
        'MAX_STEPS_EXCEEDED',
      );
    }

    this.state.stepCount += 1;

    const step: TraceStep = {
      step: this.state.stepCount,
      line: params.line,
      type: params.type,
      description: params.description,
      variables: snapshotVariables(this.state.variables),
      callStack: this.state.callStack.map((frame) => frame.functionName),
    };

    this.steps.push(step);
    return step;
  }

  /** Returns a copy of all recorded steps so far. */
  public getSteps(): TraceStep[] {
    return [...this.steps];
  }

  /** Clears recorded steps and resets stepCount on the shared state. */
  public reset(): void {
    this.steps.length = 0;
    this.state.stepCount = 0;
  }
}
