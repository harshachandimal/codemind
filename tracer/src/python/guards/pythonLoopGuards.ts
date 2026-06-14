import { TRACE_LIMITS } from '../../config/traceLimits';
import { PYTHON_ERROR_CODES } from '../errors/pythonErrors';
import { createPythonError } from '../errors/createPythonError';

export function assertPythonLoopIterationAvailable(iterationCount: number): void {
  if (iterationCount >= TRACE_LIMITS.maxLoopIterations) {
    throw createPythonError(
      `Python loop exceeded maximum iterations of ${TRACE_LIMITS.maxLoopIterations}`,
      'PYTHON_MAX_LOOP_ITERATIONS_EXCEEDED'
    );
  }
}

export function assertPythonLoopDepthAvailable(currentLoopDepth: number): void {
  if (currentLoopDepth >= TRACE_LIMITS.maxLoopDepth) {
    throw createPythonError(
      `Python loop exceeded maximum depth of ${TRACE_LIMITS.maxLoopDepth}`,
      'PYTHON_MAX_LOOP_DEPTH_EXCEEDED'
    );
  }
}
