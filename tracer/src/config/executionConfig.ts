/**
 * Execution configuration for the CodeMind tracer service.
 *
 * Runtime execution is DISABLED by default and can only be enabled
 * explicitly via environment variable. This is an intentional design
 * decision — enabling execution without a fully sandboxed runner would
 * be a security risk.
 *
 * To enable (only after sandbox is fully implemented and tested):
 *   TRACER_EXECUTION_ENABLED=true npm run dev
 *
 * SAFETY: Never set executionEnabled=true in production until:
 *   - The sandboxed child process/worker runner is implemented.
 *   - All TRACE_LIMITS (timeout, steps, output) are enforced.
 *   - All dangerous module/API access is blocked inside the sandbox.
 *   - Security tests pass.
 */

export const EXECUTION_CONFIG = {
  /**
   * Whether runtime code execution is permitted.
   * Reads TRACER_EXECUTION_ENABLED at startup — defaults to false.
   */
  executionEnabled: process.env['TRACER_EXECUTION_ENABLED'] === 'true',
} as const;
