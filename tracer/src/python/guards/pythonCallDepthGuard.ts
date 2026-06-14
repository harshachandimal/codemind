import { TRACE_LIMITS } from '../../config/traceLimits';
import { PYTHON_ERROR_CODES } from '../errors/pythonErrors';
import { createPythonError } from '../errors/createPythonError';

export function assertPythonCallDepthAvailable(currentDepth: number): void {
  if (currentDepth >= TRACE_LIMITS.maxCallDepth) {
    throw createPythonError('Maximum Python call depth exceeded.', PYTHON_ERROR_CODES.UNSUPPORTED_STATEMENT);
  }
}
