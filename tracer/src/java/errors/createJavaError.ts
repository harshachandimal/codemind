import { TraceInterpreterError } from './javaErrors';

export function createJavaError(code: string, detail?: string): TraceInterpreterError {
  return new TraceInterpreterError(detail ? `${code}: ${detail}` : code);
}
