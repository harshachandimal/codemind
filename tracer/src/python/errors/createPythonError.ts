import { TraceInterpreterError } from '../../errors/TraceInterpreterError';

export function createPythonError(message: string, code: string) {
  return new TraceInterpreterError(message, code);
}
