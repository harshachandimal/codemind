import { TRACE_LIMITS } from '../config/traceLimits.js';
import type { RuntimeValue } from '../types/interpreter.js';

/**
 * Sanitizes a RuntimeValue for safe inclusion in a trace snapshot.
 *
 * - Primitives are returned as-is.
 * - Arrays are recursively sanitized and capped at TRACE_LIMITS.maxArrayLength.
 * - Original arrays are never mutated.
 *
 * SAFETY: This function does not execute code. It only inspects and
 * restructures data that is already in the interpreter's variable store.
 */
export function sanitizeRuntimeValue(value: RuntimeValue): RuntimeValue {
  if (!Array.isArray(value)) {
    // Primitive — safe as-is
    return value;
  }

  // Cap length first, then recurse into elements
  const capped = value.slice(0, TRACE_LIMITS.maxArrayLength);
  return capped.map(sanitizeRuntimeValue);
}
