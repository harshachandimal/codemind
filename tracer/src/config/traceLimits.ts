/**
 * Central safety limits for the CodeMind tracer service.
 *
 * These constants will be enforced by the sandbox runner in a future
 * implementation step. They are defined here as the single source of
 * truth so they can be referenced from any part of the tracer service
 * without duplication.
 *
 * SAFETY NOTE: Never relax these limits without a formal security review.
 */

export const TRACE_LIMITS = {
  /** Maximum wall-clock time (ms) a trace run is allowed to take. */
  timeoutMs: 1000,

  /** Maximum number of trace steps before the run is force-terminated. */
  maxSteps: 500,

  /** Maximum length (characters) of accepted source code strings. */
  maxSourceLength: 20_000,

  /** Maximum size (bytes) of accumulated trace output. */
  maxOutputBytes: 100_000,

  /** Maximum iterations allowed in a single loop. */
  maxLoopIterations: 100,

  /** Maximum depth of function call stack before force-terminating. */
  maxCallDepth: 20,

  /** Maximum elements allowed in a tracked array structure. */
  maxArrayLength: 1000,

  /** Maximum nesting depth of loops (for inside for, while inside while, etc.). */
  maxLoopDepth: 5,
} as const;
