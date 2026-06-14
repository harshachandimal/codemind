/**
 * Trace type contracts for the CodeMind tracer service.
 *
 * These types define the shape of runtime trace data that the tracer
 * will produce in a future implementation step. No code execution
 * is performed here — these are data structures only.
 */

/**
 * The category of a single recorded trace step.
 */
export type TraceStepType =
  | 'function_call'
  | 'variable_declaration'
  | 'assignment'
  | 'loop_start'
  | 'loop_iteration'
  | 'loop_exit'
  | 'loop_tracking'
  | 'condition'
  | 'branch'
  | 'array_read'
  | 'return'
  | 'error';

/**
 * A single recorded step in an execution trace.
 */
export type TraceStep = {
  /** Sequential step index, starting from 1. */
  step: number;
  /** Source line number this step corresponds to, or null if unavailable. */
  line: number | null;
  /** Category of event recorded at this step. */
  type: TraceStepType;
  /** Human-readable description of what occurred. */
  description: string;
  /** Snapshot of named variables and their values at this step. */
  variables: Record<string, unknown>;
  /** Call stack frames active at this step. */
  callStack: string[];
};

/**
 * High-level summary of a completed (or aborted) trace run.
 */
export type TraceSummary = {
  /** Total number of steps recorded before termination. */
  totalSteps: number;
  /** Reason the trace run ended. */
  terminatedReason: 'completed' | 'timeout' | 'max_steps' | 'error' | 'not_executed';
};

/**
 * The full result returned by TraceService.trace().
 */
export type TraceResult = {
  /** Whether the trace completed without fatal errors. */
  success: boolean;
  /** Ordered list of recorded trace steps. */
  steps: TraceStep[];
  /** Summary metadata for the trace run. */
  summary: TraceSummary;
};

/**
 * The input payload accepted by TraceService.trace().
 *
 * SAFETY: sourceCode is stored for future sandboxed execution only.
 * It MUST NOT be evaluated with eval, Function, or vm in any unsafe context.
 */
export type TraceRequest = {
  /** Target language. */
  language: 'javascript' | 'python';
  /** Raw source code string to be traced (not executed yet). */
  sourceCode: string;
  /** Optional name of the entry function to call. */
  entryFunction?: string;
  /** Optional positional arguments to pass to entryFunction. */
  input?: unknown[];
};

// ─── Trace Plan types ─────────────────────────────────────────────────────────
// A trace plan is a STATIC outline of what the tracer can observe when
// execution is eventually implemented. It is produced from AST metadata only —
// no code is executed to produce it.

/**
 * Category of a single planned trace observation point.
 */
export type TracePlanStepType =
  | 'function_entry'
  | 'variable_tracking'
  | 'loop_tracking'
  | 'condition_tracking'
  | 'return_tracking';

/**
 * A single planned observation point in a future trace run.
 */
export type TracePlanStep = {
  /** Unique identifier for this plan step (e.g. "fn-add-entry"). */
  id: string;
  /** Category of this planned observation. */
  type: TracePlanStepType;
  /** Short human-readable title. */
  title: string;
  /** Longer description of what will be observed at this point. */
  description: string;
  /** Source line this step relates to, or null if unavailable. */
  line: number | null;
};

/**
 * Static trace plan produced from an AstSummary.
 * Describes what the tracer will be able to observe once execution is implemented.
 * No code is executed to produce this plan.
 */
export type TracePlan = {
  /** True when at least one traceable structure was found. */
  supported: boolean;
  /** Ordered list of planned observation points. */
  steps: TracePlanStep[];
  /** Known limitations and reminders about what is not yet implemented. */
  limitations: string[];
};

