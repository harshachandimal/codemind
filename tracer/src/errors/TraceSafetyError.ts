/**
 * TraceSafetyError — thrown when source code fails the static JavaScript
 * safety preflight check before it is admitted for tracing.
 *
 * Carries a list of human-readable violation messages so callers can
 * surface meaningful rejection reasons without exposing raw source code,
 * stack traces, or internal service state.
 *
 * SAFETY: This error is thrown before any source code is executed.
 * violation strings must describe the pattern type only — they must
 * never reproduce source code content or file paths.
 */
export class TraceSafetyError extends Error {
  /** Human-readable descriptions of each detected unsafe pattern. */
  public readonly violations: string[];

  public constructor(message: string, violations: string[] = []) {
    super(message);
    this.name = 'TraceSafetyError';
    this.violations = violations;

    // Restore the prototype chain so `instanceof TraceSafetyError`
    // works correctly after TypeScript compiles to CommonJS.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
