/**
 * executionGate — enforces the runtime execution safety gate.
 *
 * PURPOSE:
 * Provides a single, named assertion point that must be called before
 * any sandboxed code execution begins. If execution is disabled, this
 * function throws — making it impossible to accidentally run code without
 * an explicit acknowledgement that execution is enabled and safe.
 *
 * USAGE (future sandbox runner only):
 *   assertRuntimeExecutionEnabled();
 *   // only reaches here if TRACER_EXECUTION_ENABLED=true
 *   await sandbox.run(validatedRequest);
 *
 * SAFETY RULES:
 * - This function does NOT execute user code.
 * - It ONLY reads the EXECUTION_CONFIG flag and either throws or returns.
 * - Do NOT bypass this gate by catching TraceExecutionDisabledError silently.
 * - Do NOT call this from validation, preflight, parsing, or planning — only
 *   from the actual execution path (Phase 8.10+).
 */

import { EXECUTION_CONFIG } from '../config/executionConfig.js';
import { TraceExecutionDisabledError } from '../errors/TraceExecutionDisabledError.js';

/**
 * Asserts that runtime code execution is enabled.
 *
 * @throws {TraceExecutionDisabledError} if execution is disabled via config.
 */
export function assertRuntimeExecutionEnabled(): void {
  if (!EXECUTION_CONFIG.executionEnabled) {
    throw new TraceExecutionDisabledError();
  }
}
