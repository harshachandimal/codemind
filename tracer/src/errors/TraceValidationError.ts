/**
 * TraceValidationError — thrown when an incoming trace request fails
 * input validation before it reaches any execution logic.
 *
 * Carries structured per-field error details so callers can surface
 * meaningful messages to the user without exposing stack traces or
 * internal service state.
 *
 * SAFETY: This error is thrown before any source code is touched.
 * It must never contain user source code in its message or details.
 */
export class TraceValidationError extends Error {
  /** Per-field validation messages, keyed by field name. */
  public readonly details: Record<string, string[]>;

  public constructor(
    message: string,
    details: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = 'TraceValidationError';
    this.details = details;

    // Restore the prototype chain so `instanceof TraceValidationError`
    // works correctly after TypeScript compiles to CommonJS.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
