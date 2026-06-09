/**
 * TraceExecutionDisabledError — thrown when code attempts to pass through
 * the runtime execution gate while execution is disabled.
 *
 * This error signals a configuration-level block, not a user input error.
 * It should be caught by TraceService and converted to a safe result —
 * never propagated to the HTTP response as a raw exception.
 */
export class TraceExecutionDisabledError extends Error {
  public constructor() {
    super('Runtime execution is disabled.');
    this.name = 'TraceExecutionDisabledError';

    // Restore prototype chain for correct instanceof checks after
    // TypeScript compiles to CommonJS.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
