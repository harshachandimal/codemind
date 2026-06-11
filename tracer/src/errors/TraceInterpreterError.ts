/**
 * TraceInterpreterError — thrown when the AST interpreter encounters
 * an explicitly unsupported syntax node or internal runtime error.
 *
 * This error signals a safe abort. It should be caught by the interpreter
 * execution loop and converted into a final trace step error.
 */
export class TraceInterpreterError extends Error {
  public constructor(
    message: string,
    public readonly code: string = 'INTERPRETER_ERROR',
  ) {
    super(message);
    this.name = 'TraceInterpreterError';

    // Restore prototype chain for correct instanceof checks after
    // TypeScript compiles to CommonJS.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
