/**
 * TraceService — CodeMind Tracer Service
 *
 * Primary interface for generating runtime execution traces of
 * user-submitted JavaScript code.
 *
 * CURRENT STATE: Validation + preflight + parsing + trace planning active.
 *                AST interpreter active behind execution gate.
 *
 * Service pipeline (in order):
 *   1. Structural validation   (validateTraceRequest)     — shape, types, limits
 *   2. Static safety preflight (runJavaScriptPreflight)   — dangerous pattern scan
 *   3. AST parsing             (parseJavaScriptToSummary) — parse-time syntax check
 *   4. Trace plan generation   (generateTracePlan)        — static observation plan
 *   5. Execution gate check    (EXECUTION_CONFIG)         — disabled by default
 *      └─ gate closed → safe placeholder result
 *      └─ gate open   → JavaScriptInterpreter.interpret() → TraceApiResponse
 *
 * SAFETY RULES (for future implementors):
 * - NEVER call eval() on sourceCode.
 * - NEVER use the Function constructor on sourceCode.
 * - NEVER call vm.runInThisContext() or vm.runInNewContext() without
 *   a fully locked-down sandbox context.
 * - ALWAYS enforce TRACE_LIMITS before executing anything.
 * - Execution only happens through JavaScriptInterpreter, which is an AST
 *   walker — not a JS runtime.
 */

import { validateTraceRequest } from '../validators/traceRequestValidator.js';
import { runJavaScriptPreflight } from '../security/javascriptPreflight.js';
import { parseJavaScriptToSummary } from '../parsers/javascriptAstParser.js';
import { generateTracePlan } from '../planners/tracePlanGenerator.js';
import { isTracerExecutionEnabled, isPythonTracerEnabled } from '../config/runtimeFlags.js';
import { JavaScriptInterpreter } from '../interpreter/JavaScriptInterpreter.js';
import { PythonInterpreter } from '../python/pythonInterpreter.js';
import { TraceValidationError } from '../errors/TraceValidationError.js';
import { TraceSafetyError } from '../errors/TraceSafetyError.js';
import { TraceParseError } from '../errors/TraceParseError.js';
import { TraceInterpreterError } from '../errors/TraceInterpreterError.js';
import type { TraceApiResponse } from '../types/api.js';
import {
  createErrorTraceResponse,
  createPlannedTraceResponse,
  createExecutedTraceResponse
} from '../utils/createTraceApiResponse.js';

export class TraceService {
  /**
   * Validate, preflight-check, parse, plan, and (when enabled) interpret a trace.
   *
   * Accepts an `unknown` payload so validation is enforced at the service
   * boundary — callers cannot bypass it by casting types.
   *
   * @param rawRequest - Untrusted incoming payload.
   * @returns A TraceApiResponse. Never throws — all errors become structured results.
   */
  public trace(rawRequest: unknown): TraceApiResponse {
    let entryFunction: string | null = null;
    const executionEnabled = isTracerExecutionEnabled();

    // We can extract entryFunction safely if the payload seems to have it,
    // so we can include it in early error responses.
    if (typeof rawRequest === 'object' && rawRequest !== null && 'entryFunction' in rawRequest) {
      if (typeof (rawRequest as any).entryFunction === 'string') {
        entryFunction = (rawRequest as any).entryFunction;
      }
    }

    // ── Step 1: Structural validation ─────────────────────────────────────────
    let validatedRequest;

    try {
      validatedRequest = validateTraceRequest(rawRequest);
      entryFunction = validatedRequest.entryFunction ?? null;
    } catch (error) {
      if (error instanceof TraceValidationError) {
        return createErrorTraceResponse({
          message: 'Invalid trace request: ' + error.message,
          errorCode: 'VALIDATION_ERROR',
          executionEnabled,
          entryFunction,
        });
      }
      return createErrorTraceResponse({
        message: 'An unexpected error occurred while validating the trace request.',
        errorCode: 'UNKNOWN_TRACE_ERROR',
        executionEnabled,
        entryFunction,
      });
    }

    // ── Step 2: Python branch ─────────────────────────────────────────────────
    if (validatedRequest.language === 'python') {
      if (!executionEnabled) {
        return createPlannedTraceResponse({
          message: 'Runtime execution is disabled.',
          plan: null,
          entryFunction,
          language: 'python',
        });
      }
      
      const pythonEnabled = isPythonTracerEnabled();
      if (!pythonEnabled) {
        return createPlannedTraceResponse({
          message: 'Python runtime tracing is not enabled yet.',
          plan: null,
          entryFunction,
          language: 'python',
        });
      }

      try {
        const interpreter = new PythonInterpreter();
        const result = interpreter.run({
          sourceCode: validatedRequest.sourceCode,
          entryFunction: validatedRequest.entryFunction || 'main',
          input: validatedRequest.input || []
        });

        return createExecutedTraceResponse({
          message: 'Execution completed successfully.',
          // Adapter for InterpreterResult
          interpreterResult: {
            steps: result.steps,
            finalState: { returnedValue: result.returnedValue },
            terminatedReason: 'completed'
          },
          plan: null,
          entryFunction,
          language: 'python',
        });
      } catch (error: any) {
        if (error instanceof TraceInterpreterError) {
          return createErrorTraceResponse({
            message: 'Trace interpreter error: ' + error.message,
            errorCode: error.code || 'PYTHON_TRACE_ERROR',
            executionEnabled,
            entryFunction,
            language: 'python',
          });
        }
        return createErrorTraceResponse({
          message: 'An unexpected error occurred during Python interpretation.',
          errorCode: 'UNKNOWN_TRACE_ERROR',
          executionEnabled,
          entryFunction,
          language: 'python',
        });
      }
    }

    // ── Step 3: Static safety preflight (JavaScript) ──────────────────────────
    try {
      runJavaScriptPreflight(validatedRequest.sourceCode);
    } catch (error) {
      if (error instanceof TraceSafetyError) {
        const firstViolation = error.violations[0] ?? 'Unsafe pattern detected.';
        return createErrorTraceResponse({
          message: 'Trace request blocked by safety preflight: ' + firstViolation,
          errorCode: 'SAFETY_ERROR',
          executionEnabled,
          entryFunction,
        });
      }
      return createErrorTraceResponse({
        message: 'An unexpected error occurred during safety preflight.',
        errorCode: 'UNKNOWN_TRACE_ERROR',
        executionEnabled,
        entryFunction,
      });
    }

    // ── Step 3: AST parsing ───────────────────────────────────────────────────
    let astSummary;

    try {
      astSummary = parseJavaScriptToSummary(validatedRequest.sourceCode);
    } catch (error) {
      if (error instanceof TraceParseError) {
        // Here we map any parse/syntax error thrown from parseJavaScriptToSummary
        // either as PARSE_ERROR or UNSUPPORTED_SYNTAX based on the exception details if needed,
        // but currently we just assume PARSE_ERROR or if the message says unsupported.
        const code = error.message.includes('unsupported') ? 'UNSUPPORTED_SYNTAX' : 'PARSE_ERROR';
        return createErrorTraceResponse({
          message: 'JavaScript source could not be parsed: ' + error.message,
          errorCode: code,
          executionEnabled,
          entryFunction,
        });
      }
      return createErrorTraceResponse({
        message: 'An unexpected error occurred during JavaScript parsing.',
        errorCode: 'UNKNOWN_TRACE_ERROR',
        executionEnabled,
        entryFunction,
      });
    }

    // ── Step 4: Trace plan generation ─────────────────────────────────────────
    const tracePlan = generateTracePlan(astSummary);

    if (!tracePlan.supported) {
      return createErrorTraceResponse({
        message: 'The provided code contains unsupported syntax or lacks traceable structures.',
        errorCode: 'UNSUPPORTED_SYNTAX',
        executionEnabled,
        entryFunction,
      });
    }

    // ── Step 5: Execution gate ────────────────────────────────────────────────
    if (!executionEnabled) {
      return createPlannedTraceResponse({
        message: 'Runtime execution is disabled. Validation, safety preflight, AST support check, parsing, and trace planning succeeded.',
        plan: tracePlan,
        entryFunction,
      });
    }

    // ── Step 6: AST interpretation (execution gate is open) ───────────────────
    try {
      const interpreter = new JavaScriptInterpreter();
      const interpreterResult = interpreter.interpret(validatedRequest);

      return createExecutedTraceResponse({
        message: 'Execution completed successfully.',
        interpreterResult,
        plan: tracePlan,
        entryFunction,
      });
    } catch (error) {
      if (error instanceof TraceInterpreterError) {
        return createErrorTraceResponse({
          message: 'Trace interpreter error: ' + error.message,
          errorCode: error.code || 'INTERPRETER_ERROR',
          executionEnabled,
          plan: tracePlan,
          entryFunction,
        });
      }
      return createErrorTraceResponse({
        message: 'An unexpected error occurred during AST interpretation.',
        errorCode: 'UNKNOWN_TRACE_ERROR',
        executionEnabled,
        plan: tracePlan,
        entryFunction,
      });
    }
  }
}
