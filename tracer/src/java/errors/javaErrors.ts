export class TraceInterpreterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TraceInterpreterError';
  }
}

export const JAVA_PARSE_ERROR = 'JAVA_PARSE_ERROR';
export const JAVA_ENTRY_METHOD_NOT_FOUND = 'JAVA_ENTRY_METHOD_NOT_FOUND';
export const JAVA_UNSUPPORTED_STATEMENT = 'JAVA_UNSUPPORTED_STATEMENT';
export const JAVA_UNSUPPORTED_EXPRESSION = 'JAVA_UNSUPPORTED_EXPRESSION';
export const JAVA_RUNTIME_TYPE_ERROR = 'JAVA_RUNTIME_TYPE_ERROR';
export const JAVA_RETURN_OUTSIDE_METHOD = 'JAVA_RETURN_OUTSIDE_METHOD';
export const JAVA_VARIABLE_NOT_FOUND = 'JAVA_VARIABLE_NOT_FOUND';
export const JAVA_TYPE_MISMATCH = 'JAVA_TYPE_MISMATCH';
