import { sanitizeRuntimeValue } from './sanitizeRuntimeValue.js';
import type { VariableStore } from '../types/interpreter.js';

/**
 * Creates a sanitized snapshot of the current variable store.
 *
 * - Returns a shallow clone of the store with each value independently sanitized.
 * - Does not return references to original arrays.
 * - Does not mutate original variables.
 *
 * SAFETY: This function does not execute code. It only copies and sanitizes
 * values that already exist in the interpreter's state.
 */
export function snapshotVariables(variables: VariableStore): VariableStore {
  const snapshot: VariableStore = {};

  for (const key of Object.keys(variables)) {
    // Non-null assertion is safe here — we are iterating own keys
    snapshot[key] = sanitizeRuntimeValue(variables[key]!);
  }

  return snapshot;
}
