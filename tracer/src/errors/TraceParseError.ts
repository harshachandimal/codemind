/**
 * TraceParseError — thrown when user-submitted JavaScript source code
 * cannot be successfully parsed into an AST.
 *
 * SAFETY: The error message must never include raw source code, parser
 * stack traces, or internal file paths. Keep messages generic and safe.
 */
export class TraceParseError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'TraceParseError';

    // Restore prototype chain for correct instanceof checks after
    // TypeScript compiles to CommonJS.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
