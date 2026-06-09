/**
 * traceRequestValidator — validates raw incoming trace request payloads
 * before they reach any service or execution logic.
 *
 * All validation is purely structural and string-level.
 * Source code is NEVER parsed, interpreted, or executed here.
 *
 * SAFETY RULES:
 * - Do NOT eval sourceCode.
 * - Do NOT parse sourceCode as JavaScript.
 * - Do NOT modify or sanitize sourceCode content (return it as-is).
 * - Do NOT pass sourceCode to any child process or worker here.
 */

import { TRACE_LIMITS } from '../config/traceLimits';
import { TraceValidationError } from '../errors/TraceValidationError';
import type { TraceRequest } from '../types/trace';

// ─── Max input arguments allowed per request ─────────────────────────────────
const MAX_INPUT_ARGS = 10;

// ─── Safe JavaScript identifier pattern ──────────────────────────────────────
// Allows letters, digits, underscore, dollar sign.
// Must start with a letter, underscore, or dollar sign.
// Does NOT allow dots (no member access), brackets, or spaces.
const SAFE_IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Type guard: checks that `value` is a plain non-null object.
 * Excludes arrays, null, and primitives.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Appends a validation message to the details map for a given field.
 */
function addError(
  details: Record<string, string[]>,
  field: string,
  message: string,
): void {
  if (!Object.prototype.hasOwnProperty.call(details, field)) {
    details[field] = [];
  }
  (details[field] as string[]).push(message);
}

// ─── Main validator ───────────────────────────────────────────────────────────

/**
 * Validates a raw unknown payload against the TraceRequest contract.
 *
 * Throws {@link TraceValidationError} with structured per-field details
 * if the payload is invalid. Returns the typed TraceRequest on success.
 *
 * @param value - Raw payload from an untrusted caller.
 * @returns A validated, typed TraceRequest.
 * @throws {TraceValidationError} if any field fails validation.
 */
export function validateTraceRequest(value: unknown): TraceRequest {
  const details: Record<string, string[]> = {};

  // ── 1. Must be a plain object ─────────────────────────────────────────────
  if (!isRecord(value)) {
    throw new TraceValidationError('Invalid trace request.', {
      request: ['Request body must be a non-null object.'],
    });
  }

  // ── 2. language ───────────────────────────────────────────────────────────
  if (value['language'] !== 'javascript') {
    addError(details, 'language', 'Only JavaScript tracing is supported.');
  }

  // ── 3. sourceCode ─────────────────────────────────────────────────────────
  const sourceCode = value['sourceCode'];

  if (typeof sourceCode !== 'string') {
    addError(details, 'sourceCode', 'Source code must be a string.');
  } else if (sourceCode.trim().length === 0) {
    addError(details, 'sourceCode', 'Source code is required.');
  } else if (sourceCode.length > TRACE_LIMITS.maxSourceLength) {
    addError(
      details,
      'sourceCode',
      `Source code must not exceed ${TRACE_LIMITS.maxSourceLength.toLocaleString()} characters.`,
    );
  }

  // ── 4. entryFunction (optional) ───────────────────────────────────────────
  const entryFunction = value['entryFunction'];

  if (entryFunction !== undefined) {
    if (typeof entryFunction !== 'string') {
      addError(details, 'entryFunction', 'Entry function name must be a string.');
    } else if (!SAFE_IDENTIFIER_PATTERN.test(entryFunction)) {
      addError(
        details,
        'entryFunction',
        'Entry function name must be a valid JavaScript identifier ' +
          '(letters, digits, _ or $; cannot start with a digit).',
      );
    }
  }

  // ── 5. input (optional) ───────────────────────────────────────────────────
  const input = value['input'];

  if (input !== undefined) {
    if (!Array.isArray(input)) {
      addError(details, 'input', 'Input must be an array.');
    } else if (input.length > MAX_INPUT_ARGS) {
      addError(
        details,
        'input',
        `Input must not exceed ${MAX_INPUT_ARGS} arguments.`,
      );
    }
  }

  // ── Throw if any field failed ─────────────────────────────────────────────
  if (Object.keys(details).length > 0) {
    throw new TraceValidationError('Invalid trace request.', details);
  }

  // ── Return typed TraceRequest ─────────────────────────────────────────────
  // sourceCode is guaranteed to be a non-empty string at this point.
  // It is returned as-is — we do NOT modify, sanitize, or parse it here.
  return {
    language: 'javascript',
    sourceCode: sourceCode as string,
    ...(typeof entryFunction === 'string' && { entryFunction }),
    ...(Array.isArray(input) && { input }),
  };
}
