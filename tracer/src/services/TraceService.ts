/**
 * TraceService — CodeMind Tracer Service
 *
 * Primary interface for generating runtime execution traces of
 * user-submitted JavaScript code.
 *
 * CURRENT STATE: Validation + preflight + parsing + trace planning active.
 *                Execution is NOT implemented.
 *
 * Service pipeline (in order):
 *   1. Structural validation   (validateTraceRequest)     — shape, types, limits
 *   2. Static safety preflight (runJavaScriptPreflight)   — dangerous pattern scan
 *   3. AST parsing             (parseJavaScriptToSummary) — parse-time syntax check
 *   4. Trace plan generation   (generateTracePlan)        — static observation plan
 *   5. Placeholder result                                  — execution not yet implemented
 *
 * SAFETY RULES (for future implementors):
 * - NEVER call eval() on sourceCode.
 * - NEVER use the Function constructor on sourceCode.
 * - NEVER call vm.runInThisContext() or vm.runInNewContext() without
 *   a fully locked-down sandbox context.
 * - ALWAYS enforce TRACE_LIMITS before executing anything.
 * - ALWAYS run user code in an isolated child process or worker thread.
 */

import { createTraceErrorResult } from '../utils/createTraceErrorResult.js';
import { validateTraceRequest } from '../validators/traceRequestValidator.js';
import { runJavaScriptPreflight } from '../security/javascriptPreflight.js';
import { parseJavaScriptToSummary } from '../parsers/javascriptAstParser.js';
import { generateTracePlan } from '../planners/tracePlanGenerator.js';
import { EXECUTION_CONFIG } from '../config/executionConfig.js';
import { TraceValidationError } from '../errors/TraceValidationError.js';
import { TraceSafetyError } from '../errors/TraceSafetyError.js';
import { TraceParseError } from '../errors/TraceParseError.js';
import type { TraceResult } from '../types/trace.js';

export class TraceService {
  /**
   * Validate, preflight-check, parse, plan, and (in a future phase) execute a trace.
   *
   * Accepts an `unknown` payload so validation is enforced at the service
   * boundary — callers cannot bypass it by casting types.
   *
   * @param rawRequest - Untrusted incoming payload.
   * @returns A TraceResult. Never throws — all errors become structured results.
   *
   * TODO (Phase 8.9+): After planning passes, spawn an isolated sandbox,
   *   enforce TRACE_LIMITS, instrument the AST, collect TraceStep records.
   */
  public trace(rawRequest: unknown): TraceResult {
    // ── Step 1: Structural validation ─────────────────────────────────────────
    let validatedRequest;

    try {
      validatedRequest = validateTraceRequest(rawRequest);
    } catch (error) {
      if (error instanceof TraceValidationError) {
        return createTraceErrorResult(
          'Invalid trace request: ' + error.message,
        );
      }
      return createTraceErrorResult(
        'An unexpected error occurred while validating the trace request.',
      );
    }

    // ── Step 2: Static safety preflight ───────────────────────────────────────
    // Scans sourceCode as plain text. Does NOT execute it.
    try {
      runJavaScriptPreflight(validatedRequest.sourceCode);
    } catch (error) {
      if (error instanceof TraceSafetyError) {
        const firstViolation = error.violations[0] ?? 'Unsafe pattern detected.';
        return createTraceErrorResult(
          'Trace request blocked by safety preflight: ' + firstViolation,
        );
      }
      return createTraceErrorResult(
        'An unexpected error occurred during safety preflight.',
      );
    }

    // ── Step 3: AST parsing ───────────────────────────────────────────────────
    // Parse sourceCode to an AST for syntax validation and structural metadata.
    // Parsing does NOT execute the code.
    let astSummary;

    try {
      astSummary = parseJavaScriptToSummary(validatedRequest.sourceCode);
    } catch (error) {
      if (error instanceof TraceParseError) {
        return createTraceErrorResult(
          'JavaScript source could not be parsed.',
        );
      }
      return createTraceErrorResult(
        'An unexpected error occurred during JavaScript parsing.',
      );
    }

    // ── Step 4: Trace plan generation ─────────────────────────────────────────
    // Converts the AstSummary into a static plan of future observation points.
    // No code is executed. The plan is used to populate the placeholder result
    // and will be passed to the sandboxed executor in Phase 8.9+.
    const tracePlan = generateTracePlan(astSummary);

    // ── Step 5: Execution gate + placeholder ──────────────────────────────────
    // All four analysis gates passed. The execution gate is checked here as a
    // named position marker for the future sandbox runner.
    //
    // IMPORTANT: assertRuntimeExecutionEnabled() is intentionally NOT called
    // yet because execution is not implemented. When Phase 8.10 adds the
    // sandboxed runner, it must call assertRuntimeExecutionEnabled() before
    // spawning any child process or worker thread.

    return {
      success: false,
      steps: [
        {
          step: 1,
          line: null,
          type: 'error',
          description:
            'Runtime tracing is not implemented yet. ' +
            'Validation, safety preflight, parsing, and trace planning succeeded. ' +
            'Runtime execution is currently disabled.',
          variables: {
            plannedSteps: tracePlan.steps.length,
            supported: tracePlan.supported,
            executionEnabled: EXECUTION_CONFIG.executionEnabled,
          },
          callStack: [],
        },
      ],
      summary: {
        totalSteps: 1,
        terminatedReason: 'error',
      },
    };
  }
}
